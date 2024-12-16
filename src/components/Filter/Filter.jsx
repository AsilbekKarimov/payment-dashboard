import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setStatusFilter,
  setPaymentTypeFilter,
  setStartDate,
  setEndDate,
  setCourseNameFilter,
} from "../../slices/filterSlice";

const Filter = ({ courses = [], t }) => {
  const dispatch = useDispatch();
  
  // Получаем текущее состояние фильтров из Redux
  const {
    statusFilter,
    paymentTypeFilter,
    startDate,
    endDate,
    courseNameFilter,
  } = useSelector((state) => state.filter);

  return (
    <div className="mb-4 flex flex-col md:flex-row md:items-end md:space-x-6 space-y-4 md:space-y-0">
      
      {/* Status Filter */}
      <div className="flex-1 border p-2 rounded-md">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          {t("filter-status")}
        </label>
        <select
          value={statusFilter}
          onChange={(e) => dispatch(setStatusFilter(e.target.value))}
          className="block w-full px-2 py-1 border border-gray-300 rounded-md text-gray-700 bg-white text-xs focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">{t("all-statuses")}</option>
          <option value="ВЫСТАВЛЕНО">{t("process")}</option>
          <option value="ОПЛАЧЕНО">{t("success")}</option>
          <option value="ОТМЕНЕНО">{t("cancelled")}</option>
        </select>
      </div>

      {/* Payment Type Filter */}
      <div className="flex-1 border p-2 rounded-md">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          {t("filter-service")}
        </label>
        <select
          value={paymentTypeFilter}
          onChange={(e) => dispatch(setPaymentTypeFilter(e.target.value))}
          className="block w-full px-2 py-1 border border-gray-300 rounded-md text-gray-700 bg-white text-xs focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">{t("all-services")}</option>
          <option value="Payme">{t("Payme")}</option>
          <option value="Click">{t("Click")}</option>
          <option value="Uzum">{t("Uzum")}</option>
        </select>
      </div>

      {/* Date Filter (Start and End Date) */}
      <div className="flex items-center border p-2 rounded-md">
        <div className="mr-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {t("filter-start-date")}
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => dispatch(setStartDate(e.target.value))}
            className="block w-full px-2 py-1 border border-gray-300 rounded-md text-gray-700 bg-white text-xs focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {t("filter-end-date")}
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => dispatch(setEndDate(e.target.value))}
            className="block w-full px-2 py-1 border border-gray-300 rounded-md text-gray-700 bg-white text-xs focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Course Name Filter */}
      <div className="flex-1 border p-2 rounded-md">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          {t("filter-course-name")}
        </label>
        <select
          value={courseNameFilter}
          onChange={(e) => dispatch(setCourseNameFilter(e.target.value))}
          className="block w-full px-2 py-1 border border-gray-300 rounded-md text-gray-700 bg-white text-xs focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">{t("all-courses")}</option>
          {courses.length > 0 ? (
            courses.map((course) => (
              <option key={course._id} value={course.title}>
                {course.title}
              </option>
            ))
          ) : (
            <option value="">{t("no-courses-available")}</option>
          )}
        </select>
      </div>
    </div>
  );
};

export default Filter;
