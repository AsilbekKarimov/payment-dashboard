import React from "react";
import axios from "axios";
import { VscFilePdf } from "react-icons/vsc";
import CryptoJS from "crypto-js";
import { AiOutlineDelete } from "react-icons/ai";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OrderTable = ({
  currentOrders,
  t,
  getStatusBadge,
  renderLogo,
  handleItemsPerPageChange,
  itemsPerPage,
  setSelectedOrder,
  onDeleteOrder,
}) => {
  const decryptToken = () => {
    const secretKey = process.env.REACT_APP_SECRET_KEY || "your-secret-key";
    const encryptedToken = localStorage.getItem("token");
    const bytes = CryptoJS.AES.decrypt(encryptedToken, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  const generateContractPDF = async (order) => {
    try {
      const secretKey = process.env.REACT_APP_SECRET_KEY || "your-secret-key";
      const encryptedToken = localStorage.getItem("token");
      const bytes = CryptoJS.AES.decrypt(encryptedToken, secretKey);
      const token = bytes.toString(CryptoJS.enc.Utf8);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/generate-pdf`,
        { orders: [order] },
        {
          responseType: "blob",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        }
      );

      const contentType = response.headers["content-type"];
      if (contentType !== "application/pdf") {
        throw new Error("Invalid PDF response");
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${order.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error generating contract PDF:", err);
      alert("Ошибка при загрузке PDF-документа. Пожалуйста, попробуйте позже.");
    }
  };

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  const truncateToTwoWords = (text) => {
    if (!text) return "";
    const words = text.split(" ");
    return words.length > 2 ? `${words[0]} ${words[1]} ...` : text;
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      const token = decryptToken();
      await axios.delete(`${process.env.REACT_APP_API_URL}/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      onDeleteOrder(orderId);
      toast.success(t("order-deleted-success"));
    } catch (error) { 
      console.error("Error deleting order:", error);
      toast.error(t("order-deleted-error"));
      alert(t("delete-failed"));
    }
  };

  return (
    <div className="hidden md:block max-w-full overflow-x-auto shadow-md rounded-lg">
      <table className="min-w-full table-auto text-xs md:text-sm text-left border border-gray-200">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-2 py-2 text-xs font-medium uppercase tracking-wider">
              {t("invoice-number")}
            </th>
            <th className="px-2 py-2 text-xs font-medium uppercase tracking-wider">
              {t("client")}
            </th>
            <th className="px-2 py-2 text-xs font-medium uppercase tracking-wider">
              {t("course")}
            </th>
            <th className="px-2 py-2 text-xs font-medium uppercase tracking-wider">
              {t("amount")}
            </th>
            <th className="px-2 py-2 text-xs font-medium uppercase tracking-wider">
              {t("status")}
            </th>
            <th className="px-2 py-2 text-xs font-medium uppercase tracking-wider">
              {t("created-date")}
            </th>
            <th className="px-2 py-2 text-xs font-medium uppercase tracking-wider">
              {t("service")}
            </th>
            <th className="px-2 py-2 text-xs font-medium uppercase tracking-wider">
              {t("action")}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentOrders.map((order, index) => (
            <tr
              key={index}
              className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
              onClick={() => setSelectedOrder(order)}
            >
              <td className="px-2 py-2 truncate">
                {order?.course_id?.prefix ? order?.course_id?.prefix : "U"}
                {order.invoiceNumber || t("no-data")}
              </td>
              <td className="px-2 py-2 truncate">
                {truncateToTwoWords(order.clientName) || t("no-data")}
              </td>
              <td className="px-2 py-2 truncate">
                {truncateText(order?.course_id?.title || t("no-data"), 30)}
              </td>
              <td className="px-2 py-2 truncate">
                {order.amount
                  ? order.status === "ОПЛАЧЕНО"
                    ? order.paymentType !== "Click"
                      ? `${order.amount / 100} ${t("currency")}`
                      : `${order.amount} ${t("currency")}`
                    : `${order.amount} ${t("currency")}`
                  : t("no-data")}
              </td>
              <td className="px-2 py-2 text-xs truncate">
                {getStatusBadge(order.status)}
              </td>
              <td className="px-2 py-2 truncate">
                {order.create_time
                  ? new Date(order.create_time).toLocaleDateString("en-GB") +
                    " | " +
                    new Date(order.create_time).toLocaleTimeString("en-GB", {
                      hour12: false,
                    })
                  : t("no-data")}
              </td>
              <td className="px-2 py-2 text-xs truncate">
                {renderLogo(order.paymentType)}
              </td>
              <td className="px-2 py-2  gap-2 text-center"> {/* classga flex berish kere */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    generateContractPDF(order);
                  }}
                  className={`px-1 py-1 ${
                    order.status === "ОПЛАЧЕНО"
                      ? "bg-blue-500"
                      : "bg-gray-300 cursor-not-allowed"
                  } text-white rounded-lg`}
                  disabled={order.status !== "ОПЛАЧЕНО"}
                >
                  <VscFilePdf className="text-2xl" />
                </button>
                {/* <button
                  className="btn btn-sm bg-red-500 z-10 px-1 hover:bg-red-600 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteOrder(order._id);
                  }}
                >
                  <AiOutlineDelete className="text-2xl"/>
                </button> */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end p-2">
        <select
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          className="select select-bordered w-full max-w-20"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={200}>200</option>
          <option value={500}>500</option>
        </select>
      </div>
    </div>
  );
};

export default OrderTable;
