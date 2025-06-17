import { Entity, PrimaryGeneratedColumn, BaseEntity, Column, ManyToMany, OneToMany } from "typeorm";
import { Place } from "./Place";

@Entity()
export class Currency extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name: string;

  @Column("float")
  rate_per_dollar: number;

  @Column()
  code: string;

  @Column()
  symbol: string;

  @ManyToMany(() => Place, place => place.currencys)
  places: Place[];
}

export const addCurrency = async (name: string, rate_per_dollar: number, code: string, symbol: string) => {
  const currency = Currency.create({ name, rate_per_dollar, code, symbol });
  currency.save();
  return currency;
};

export const getCurrencyById = async (id: number) => {
  return await Currency.findOne({ where: { id } });
};

export const updateCurrency = async (
  id: number,
  name: string,
  rate_per_dollar: number,
  code: string,
  symbol: string,
) => {
  const currency = await getCurrencyById(id);

  if (!currency) {
    throw new Error("currency not Found please try again");
  }
  currency.name = name;
  currency.rate_per_dollar = rate_per_dollar;
  currency.code = code;
  currency.symbol = symbol;

  currency.save();
  return currency;
};

export const deleteCurrency = async (id: number) => {
  const currency = await getCurrencyById(id);

  if (!currency) {
    throw new Error("currency not Found");
  }
  currency.remove();
  return "Deleted";
};

export const getCurrencies = async () => {
  return await Currency.find();
};

// Updated function to use external forex API
export const convertCurrency = async (
  senderAmount: number,
  senderCurrencyId: number,
  receiverCurrencyId: number
) => {
  try {
    // Get both currencies from database to get their codes
    const senderCurrency = await Currency.findOne({ where: { id: senderCurrencyId } });
    const receiverCurrency = await Currency.findOne({ where: { id: receiverCurrencyId } });

    if (!senderCurrency || !receiverCurrency) {
      throw new Error("One or both currencies not found");
    }

    // Fetch live exchange rates from the API
    const response = await fetch('https://forex-morning-111.bxmedia.workers.dev/');
    
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const data = await response.json();

    if (data.result !== "success") {
      throw new Error("Failed to fetch exchange rates from API");
    }

    const rates = data.conversion_rates;

    // Check if the currency codes exist in the API response
    if (!rates[senderCurrency.code]) {
      throw new Error(`Exchange rate not found for sender currency: ${senderCurrency.code}`);
    }

    if (!rates[receiverCurrency.code]) {
      throw new Error(`Exchange rate not found for receiver currency: ${receiverCurrency.code}`);
    }

    // Convert using live rates
    // Since API base is USD, convert: sender -> USD -> receiver
    const senderRateToUSD = rates[senderCurrency.code];
    const receiverRateToUSD = rates[receiverCurrency.code];

    // Convert sender amount to USD
    const amountInUSD = senderAmount / senderRateToUSD;
    
    // Convert from USD to receiver currency
    const receiverAmount = amountInUSD * receiverRateToUSD;

    // Calculate direct conversion rate
    const conversionRate = receiverRateToUSD / senderRateToUSD;

    return {
      senderCurrency: senderCurrency,
      receiverCurrency: receiverCurrency,
      senderAmount: senderAmount,
      receiverAmount: Number(receiverAmount.toFixed(2)),
      conversionRate: Number(conversionRate.toFixed(6)),
      apiLastUpdate: data.time_last_update_utc,
      apiNextUpdate: data.time_next_update_utc
    };

  } catch (error) {
    // Fallback to database rates if API fails
    console.warn('API conversion failed, falling back to database rates:', error);
    
    const senderCurrency = await Currency.findOne({ where: { id: senderCurrencyId } });
    const receiverCurrency = await Currency.findOne({ where: { id: receiverCurrencyId } });

    if (!senderCurrency || !receiverCurrency) {
      throw new Error("One or both currencies not found");
    }

    // Convert to USD as intermediate step (fallback method)
    const amountInUSD = senderAmount / senderCurrency.rate_per_dollar;
    
    // Convert from USD to receiver currency
    const receiverAmount = amountInUSD * receiverCurrency.rate_per_dollar;

    return {
      senderCurrency: senderCurrency,
      receiverCurrency: receiverCurrency,
      senderAmount: senderAmount,
      receiverAmount: Number(receiverAmount.toFixed(2)),
      conversionRate: Number((receiverCurrency.rate_per_dollar / senderCurrency.rate_per_dollar).toFixed(6)),
      fallbackUsed: true,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};