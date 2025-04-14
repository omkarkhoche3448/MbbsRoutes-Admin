const BASE_URL = import.meta.env.VITE_BASE_URL;

export const fetchStudents = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/consultation/all`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error fetching students:", error);
      throw error;
    }
  };