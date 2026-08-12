import { SortOrder } from 'mongoose';
import { Sort } from '../dtos/query.dto';

export const getSortOption = (
  Desc: -1 | 1,
  sort?: Sort,
): Record<string, SortOrder> => {
  if (!sort) return {};
  switch (sort) {
    case Sort.Title:
      return { title: Desc };
    case Sort.CreatedAt:
      return { createdAt: Desc };
    case Sort.UpdatedAt:
      return { updatedAt: Desc };
  }
};
