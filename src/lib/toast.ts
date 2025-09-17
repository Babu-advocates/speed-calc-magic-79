import toast from "react-hot-toast";

// Centralized toast utilities for the entire application
// All toasts will appear at top-center with white background

export const showToast = {
  success: (message: string) => {
    return toast.success(message);
  },
  
  error: (message: string) => {
    return toast.error(message);
  },
  
  loading: (message: string) => {
    return toast.loading(message);
  },
  
  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    });
  },

  custom: (message: string, options?: any) => {
    return toast(message, options);
  },

  dismiss: (toastId?: string) => {
    return toast.dismiss(toastId);
  },
};

// Export default toast for direct usage
export { toast as default };