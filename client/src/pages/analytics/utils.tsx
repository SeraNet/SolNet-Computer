/**
 * Utility functions for Analytics Hub
 */

import React from "react";
import { AlertTriangle, CheckCircle, Target, Clock } from "lucide-react";

export const getStatusColor = (status: string) => {
  switch (status) {
    case "over":
      return "bg-red-100 text-red-800 border-red-200";
    case "under":
      return "bg-green-100 text-green-800 border-green-200";
    case "on-track":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "over":
      return <AlertTriangle className="h-4 w-4" />;
    case "under":
      return <CheckCircle className="h-4 w-4" />;
    case "on-track":
      return <Target className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};
















