import { sortOrder } from '../dtos/query.dto';

export const getOrderOption = (order: sortOrder): 1 | -1 => {
  return order === sortOrder.Desc ? -1 : 1;
};
