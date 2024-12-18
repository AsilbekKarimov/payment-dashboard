import axios from "axios";
import { VscFilePdf } from "react-icons/vsc";
import CryptoJS from 'crypto-js';

const OrderCards = ({
  currentOrders,
  getStatusBadge,
  renderLogo,
  t,
  handleItemsPerPageChange,
  itemsPerPage,
}) => {
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

  return (
    <div className="md:hidden">
      <div className="grid grid-cols-1 gap-4">
        {currentOrders.length > 0 ? (
          currentOrders.map((order, index) => (
            <div key={index} className="bg-white p-4 rounded shadow-md">
              <div className="flex justify-end">
                <p className="text-xs">{getStatusBadge(order.status)}</p>
              </div>
              <h2 className="font-bold break-all">
                {t("invoice-number")}:{order.course_id?.prefix || "U"}
                {order.invoiceNumber || t("no-data")}
              </h2>

              <p className="break-all">
                <strong>{t("client")}:</strong>{" "}
                {order.clientName || t("no-data")}
              </p>
              <p className="break-all">
                <strong>{t("course")}:</strong>{" "}
                {order?.course_id?.title || t("no-data")}
              </p>
              <p className="break-all">
                <strong>{t("amount")}:</strong>
                {order.amount
                  ? order.status === "ОПЛАЧЕНО"
                    ? `${order.amount / 100} ${t("currency")}`
                    : `${order.amount} ${t("currency")}`
                  : t("no-data")}
              </p>
              <p className="break-all">
                <strong>{t("created-date")}:</strong>{" "}
                {order.create_time
                  ? new Date(order.create_time).toLocaleDateString()
                  : t("no-data")}
              </p>
              <p className="break-all">
                <strong>{t("client-phone")}:</strong>{" "}
                {order.clientPhone || t("no-data")}
              </p>
              <p className="break-all">
                <strong>{t("tg-username")}:</strong>{" "}
                {order.tgUsername || t("no-data")}
              </p>
              <div>
                <strong>{t("service")}:</strong> {renderLogo(order.paymentType)}
              </div>

              <div className="mt-4 text-right">
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
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4">{t("orders-not-found")}</div>
        )}
      </div>

      <div className="flex justify-end mt-4">
        <select
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          className="select select-bordered w-full"
        >
          <option value={10}>10</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={200}>200</option>
        </select>
      </div>
    </div>
  );
};

export default OrderCards;
