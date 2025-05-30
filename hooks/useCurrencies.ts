import React, { useEffect, useState } from "react";
import { generateAxiosInstance } from "../shared/constants";
import { Currency } from "../types/Currency";
const useCurrencies = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCurrencies = async () => {
    try {
      setLoading(true);
      const axiosInstance = await generateAxiosInstance(true);

      let res = await axiosInstance.get("/currency/all");

      if (res.status) {
        setLoading(false);
        setCurrencies(res.data.payload);
        // ;
      }
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);
  return { currencies, loading, fetchCurrencies };
};

export default useCurrencies;
