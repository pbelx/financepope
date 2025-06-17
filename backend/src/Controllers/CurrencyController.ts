import { Request, Response } from "express";

import {
  addCurrency,
  updateCurrency,
  deleteCurrency,
  getCurrencyById,
  getCurrencies,
  convertCurrency
} from "../Entities/Currency";
import { customPayloadResponse } from "../Helpers/Helpers";

export const handleSaveCurrency = async (req: Request, res: Response) => {
  try {
    const { name, ratePerDollar, id,code,symbol } = req.body;

    const { path } = req.route;

    const isUpdate = path?.includes("currency/update");

    if (isUpdate && !id) {
      return res
        .status(400) // Bad request for missing input
        .json(customPayloadResponse(false, "currency ID required"));
    }

    if (!name) {
      return res
        .status(400) // Bad request for missing input
        .json(customPayloadResponse(false, "currency name required"));
    }

    if (!ratePerDollar) {
      return res
        .status(400) // Bad request for missing input
        .json(customPayloadResponse(false, "rate per dollar required"));
    }

    if (isUpdate) {
      const find = await getCurrencyById(id);

      if (!find) {
        return res
          .status(500) // Internal server error
          .json(customPayloadResponse(false, "currency not found"));
      }

      const currency = await updateCurrency(id, name, ratePerDollar,code,symbol);
      return res.status(200).json(customPayloadResponse(true, currency));
    } else {
      const currency = await addCurrency(name, ratePerDollar,code,symbol);
      return res.status(200).json(customPayloadResponse(true, currency));
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500) // Internal server error
      .json(
        customPayloadResponse(
          false,
          `Error ${
            req.route?.path?.includes("update") ? "updating" : "creating"
          } currency`
        )
      );
  }
};

export const handleCurrencyDelete = async (req: Request, res: Response) => {
  try {
    const {id} = req.params;
    if (!id) {
      return res
        .status(400) // Bad request for missing input
        .json(customPayloadResponse(false, "currency ID  required"));
    }
    
    const currency = await deleteCurrency(Number(id));

    return res.status(200).json(customPayloadResponse(true, currency));
  } catch (error) {
    console.error(error);
    return res
      .status(500) // Internal server error
      .json(customPayloadResponse(false, "Error creating currency"));
  }
};

export const handleCurrencyFetch = async (req: Request, res: Response) => {
  try {
    const currencies = await getCurrencies();
    return res.status(200).json(customPayloadResponse(true, currencies));
  } catch (error) {
    console.error(error);
    return res
      .status(500) // Internal server error
      .json(customPayloadResponse(false, "Error creating currency"));
  }
};

// peter edit 

export const handleCurrencyConversion = async (req: Request, res: Response) => {
  try {
    const { senderAmount, senderCurrencyId, receiverCurrencyId } = req.body;
    
    // Validate inputs
    if (!senderAmount || isNaN(Number(senderAmount)) || Number(senderAmount) <= 0) {
      return res
        .status(400)
        .json(customPayloadResponse(false, "Valid sender amount required"));
    }
    
    if (!senderCurrencyId) {
      return res
        .status(400)
        .json(customPayloadResponse(false, "Sender currency ID required"));
    }
    
    if (!receiverCurrencyId) {
      return res
        .status(400)
        .json(customPayloadResponse(false, "Receiver currency ID required"));
    }
    
    const result = await convertCurrency(
      Number(senderAmount),
      Number(senderCurrencyId),
      Number(receiverCurrencyId)
    );
    
    return res.status(200).json(customPayloadResponse(true, result));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(customPayloadResponse(false, "Error converting currency"));
  }
};
