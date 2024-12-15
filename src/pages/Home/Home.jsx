import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Filter from "../../components/Filter/Filter";
import OrderTable from "../../components/OrderTable/OrderTable";
import Pagination from "../../components/Pagination/Pagination";
import OrderCards from "../../components/OrderCards/OrderCards";
import OrderDetailsModal from "../../components/OrderFetailsModal/OrderDetailsModal";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import CryptoJS from "crypto-js";
import { HiOutlineDocumentArrowUp } from "react-icons/hi2";


const Home = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [courses, setCourses] = useState([]);
  const { t } = useTranslation();
  const printRef = useRef();

  const secretKey = process.env.REACT_APP_SECRET_KEY || 'your-secret-key';

  const decryptToken = () => {
    const encryptedToken = localStorage.getItem('token');
    const bytes = CryptoJS.AES.decrypt(encryptedToken, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  const handleDownloadPdf = async () => {
    const element = printRef.current;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageHeight = pdf.internal.pageSize.getHeight();
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdf.internal.pageSize.getWidth()) / imgProps.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdf.internal.pageSize.getWidth(), imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdf.internal.pageSize.getWidth(), imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save('transactions.pdf');
  };

  const {
    statusFilter,
    paymentTypeFilter,
    startDate,
    endDate,
    courseNameFilter,
  } = useSelector((state) => state.filter);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = decryptToken();
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/orders`,
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        const reversedOrders = response.data.data.reverse();
        setOrders(reversedOrders);
        setFilteredOrders(reversedOrders);
        setLoading(false);
      } catch (err) {
        setError(t("fetch-failed"));
        setLoading(false);
      }
    };

    const fetchCourses = async () => {
      try {
        const token = decryptToken();
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/courses`,
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchOrders();
    fetchCourses();
  }, [t]);

  const handleNewOrder = (newOrder) => {
    setOrders((prevOrders) => [newOrder, ...prevOrders]);
    setFilteredOrders((prevFilteredOrders) => [
      newOrder,
      ...prevFilteredOrders,
    ]);
    setCurrentPage(1);
  };

  useEffect(() => {
    let filtered = orders;

    if (statusFilter) {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    if (paymentTypeFilter) {
      filtered = filtered.filter(
        (order) => order.paymentType === paymentTypeFilter
      );
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.create_time);
        return orderDate >= start && orderDate <= end;
      });
    }

    if (courseNameFilter) {
      filtered = filtered.filter(
        (order) => order.course_id?.title === courseNameFilter
      );
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [
    statusFilter,
    paymentTypeFilter,
    startDate,
    endDate,
    courseNameFilter,
    orders,
  ]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  const handleExportToExcel = async () => {
  try {
    const orderIds = filteredOrders.map(order => order._id);

    const response = await axios.get(
      `https://api.norbekovgroup.uz/api/v1/export/order`,
      {
        params: { orderIds: orderIds.join(',') },
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "orders_data.xlsx");
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  } catch (error) {
    console.error("Error exporting to Excel:", error);
  }
};

  

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  const closeModal = () => setSelectedOrder(null);

  const getStatusBadge = (status) => {
    switch (status) {
      case "НЕ ОПЛАЧЕНО":
        return (
          <span className="px-2 py-1 rounded bg-red-100 text-red-700 text-[10px] font-semibold">
            {t("failed")}
          </span>
        );
      case "ВЫСТАВЛЕНО":
        return (
          <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-[10px] font-semibold">
            {t("process")}
          </span>
        );
      case "ОПЛАЧЕНО":
        return (
          <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-[10px] font-semibold">
            {t("success")}
          </span>
        );
      case "ОТМЕНЕНО":
        return (
          <span className="px-2 py-1 rounded bg-red-500 text-red-100 text-[10px] font-semibold">
            {t("cancelled")}
          </span>
        );
      default:
        return <span>{t("no-data")}</span>;
    }
  };

  const renderLogo = (paymentType) => {
    switch (paymentType) {
      case "Payme":
        return <img src="/payme.png" alt="Payme Logo" className="w-12 h-4" />;
      case "Click":
        return (
          <img src="/click.png" alt="Click Logo" className="w-12 h-[14px]" />
        );
      case "Uzum":
        return (
          <img src="/uzum-bank.png" alt="Uzum Bank Logo" className="w-12 h-5" />
        );
      default:
        return <span>{t("no-service")}</span>;
    }
  };

  return (
    <div className="px-5 md:px-8 py-2">
      <h1 className="text-2xl mb-2 font-semibold">{t("orders")}</h1>

      <Filter courses={courses} t={t} />
      {loading ? (
        <div className="text-center py-4 mx-auto">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : error ? (
        <div className="text-center py-4 text-red-500">{error}</div>
      ) : (
        <>
        <div className="flex justify-end">
            <button
              className="btn mb-4 bg-gradient-to-t from-green-500 to-green-400 text-white"
              onClick={handleExportToExcel}
            >
              <HiOutlineDocumentArrowUp size={21} />
              {t("export-to-excel")}
            </button>
          </div>
          <div ref={printRef}>
            <OrderTable
              currentOrders={currentOrders}
              t={t}
              getStatusBadge={getStatusBadge}
              renderLogo={renderLogo}
              handleItemsPerPageChange={handleItemsPerPageChange}
              itemsPerPage={itemsPerPage}
              setSelectedOrder={setSelectedOrder}
            />
          </div>

          <OrderCards
            currentOrders={currentOrders}
            getStatusBadge={getStatusBadge}
            renderLogo={renderLogo}
            t={t}
            handleItemsPerPageChange={handleItemsPerPageChange}
            itemsPerPage={itemsPerPage}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            t={t}
          />
        </>
      )}
      <OrderDetailsModal
        selectedOrder={selectedOrder}
        t={t}
        getStatusBadge={getStatusBadge}
        renderLogo={renderLogo}
        closeModal={closeModal}
      />
    </div>
  );
};

export default Home;
