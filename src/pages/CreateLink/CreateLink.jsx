import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import Pagination from "../../components/Pagination/Pagination";
import Modal from "./Modal";
import ConfirmModal from "./ConfirmModal";
import CreateIndividualLink from "../../components/CreateIndividualLink";

const CoursesTable = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [successfulPurchases, setSuccessfulPurchases] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10); // State for items per page
  const [selectedCourse, setSelectedCourse] = useState(null); // State for the course to edit
  const [courseToDelete, setCourseToDelete] = useState(null); // State for the course to delete

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/courses`
        );
        setCourses(response.data);
        setFilteredCourses(response.data);
        setLoading(false);
      } catch (err) {
        setError(t("fetch-failed"));
        setLoading(false);
      }
    };

    fetchCourses();
  }, [t]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/orders`
        );
        const orders = response.data.data;
        const successfulOrders = orders.filter(
          (order) => order.status === t("success")
        );
        const successfulOrdersCount = {};
        courses.forEach((course) => {
          const courseOrders = successfulOrders.filter(
            (order) => order.course_id.title === course.title
          );
          successfulOrdersCount[course.title] = courseOrders.length;
        });

        setSuccessfulPurchases(successfulOrdersCount);
      } catch (err) {
        console.error(t("fetch-failed"), err);
      }
    };

    if (courses.length > 0) {
      fetchOrders();
    }
  }, [courses, t]);

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const currentCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to page 1 when items per page changes
  };

  const handleEditClick = (course) => {
    setSelectedCourse(course); // Set the selected course for editing
  };

  const handleDeleteClick = (course) => {
    setCourseToDelete(course); // Set the selected course for deletion
  };

  const handleConfirmEdit = async (updatedData) => {
    try {
      const response = await axios.put(
        `https://api.norbekovgroup.uz/api/v1/courses/${selectedCourse._id}`,
        updatedData
      );

      const updatedCourses = courses.map((course) =>
        course._id === selectedCourse._id
          ? { ...course, ...updatedData }
          : course
      );
      const updatedFilteredCourses = filteredCourses.map((course) =>
        course._id === selectedCourse._id
          ? { ...course, ...updatedData }
          : course
      );

      setCourses(updatedCourses);
      setFilteredCourses(updatedFilteredCourses);

      setSelectedCourse(null); // Close modal after success
    } catch (error) {
      console.error(t("course-error"), error);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(
        `https://api.norbekovgroup.uz/api/v1/courses/${courseToDelete._id}`
      );

      // Remove the deleted course from the lists
      const updatedCourses = courses.filter(
        (course) => course._id !== courseToDelete._id
      );
      const updatedFilteredCourses = filteredCourses.filter(
        (course) => course._id !== courseToDelete._id
      );

      setCourses(updatedCourses);
      setFilteredCourses(updatedFilteredCourses);
      setCourseToDelete(null); // Close the confirmation modal
    } catch (error) {
      console.error(t("course-fail"), error);
    }
  };

  return (
    <div className="px-4 md:px-8 py-2">
      <div className="flex justify-between items-center w-full">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2 w-full">
          {t("course-list")}
        </h1>

        <CreateIndividualLink />
      </div>

      {loading ? (
        <div className="text-center py-4 mx-auto">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : error ? (
        <div className="text-center py-4 text-red-500">{error}</div>
      ) : (
        <div>
          {/* Table for larger screens */}
          <div className="hidden md:block">
            <div className="max-w-full overflow-x-auto shadow-md rounded-lg">
              <table className="min-w-full table-auto text-xs md:text-sm text-left border border-gray-200">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-2 text-xs font-medium uppercase tracking-wider">
                      {t("table-course-title")}
                    </th>
                    <th className="px-4 py-2 text-xs font-medium uppercase tracking-wider">
                      {t("table-course-prefix")}
                    </th>
                    <th className="px-4 py-2 text-xs font-medium uppercase tracking-wider">
                      {t("table-course-price")}
                    </th>
                    <th className="px-4 py-2 text-xs font-medium uppercase tracking-wider">
                      {t("table-course-route")}
                    </th>
                    <th className="px-4 py-2 text-xs font-medium uppercase tracking-wider">
                      {t("table-successful-purchases")}
                    </th>
                    <th className="px-4 py-2 text-xs font-medium uppercase tracking-wider">
                      {t("actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentCourses.length > 0 ? (
                    currentCourses.map((course, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{course.title}</td>
                        <td className="px-4 py-2">{course.prefix}</td>
                        <td className="px-4 py-2">
                          {course.price} {t("currency")}
                        </td>
                        <td className="px-4 py-2">{course.route}</td>
                        <td className="px-4 py-2">
                          {successfulPurchases[course.title] || 0}
                        </td>
                        <td className="px-4 py-2 flex space-x-2">
                          <button
                            className="btn text-blue-500 hover:text-blue-700"
                            onClick={() => handleEditClick(course)}
                          >
                            {t("edit")}
                          </button>
                          <button
                            className="btn text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteClick(course)}
                          >
                            {t("delete")}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="w-full">
                      <td
                        colSpan="6"
                        className="text-center py-4 flex justify-center"
                      >
                        {t("course-not-found")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Items Per Page Select */}
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
                </select>
              </div>
            </div>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            t={t}
          />
        </div>
      )}

      {selectedCourse && (
        <Modal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onConfirm={handleConfirmEdit}
        />
      )}

      {courseToDelete && (
        <ConfirmModal
          message={`${t("confirm-delete-course")} ${courseToDelete.title}?`}
          onClose={() => setCourseToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default CoursesTable;
