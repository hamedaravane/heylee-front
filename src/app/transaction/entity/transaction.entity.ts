export interface Transaction {
  id: number;
  transactionDate: string;
  type: string;
  category: string;
  amount: number;
  entityName: string;
  referenceNumber: string;
  description?: string;
  paymentMethod?: string;
}

export interface TransactionDto {
  id: number;
  transaction_date: string;
  type: string;
  category: string;
  amount: number;
  entity_name: string;
  reference_number: string;
  description?: string;
  payment_method?: string;
}

export type CreateTransactionDto = Omit<TransactionDto, 'id'>;
export type CreateTransaction = Omit<Transaction, 'id'>;

export function mapTransactionDto(dto: TransactionDto): Transaction {
  return {
    id: dto.id,
    transactionDate: dto.transaction_date,
    type: dto.type,
    category: dto.category,
    amount: dto.amount,
    entityName: dto.entity_name,
    referenceNumber: dto.reference_number,
    description: dto.description,
    paymentMethod: dto.payment_method
  };
}

export function mapTransactionToDto(data: Transaction): TransactionDto {
  return {
    id: data.id,
    transaction_date: data.transactionDate,
    type: data.type,
    category: data.category,
    amount: data.amount,
    entity_name: data.entityName,
    reference_number: data.referenceNumber,
    description: data.description,
    payment_method: data.paymentMethod
  };
}
