import { SortOrder } from 'mongoose';
import { Sort } from 'src/blog/dtos/blog.query.dto';
import { ProductSort } from 'src/product/dtos/product-query.dto';
import { SeoSort } from 'src/seo/dtos/seo.query';
import { UserSort } from 'src/user/dtos/user.query.dto';

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

export const getUserSortOption = (
  Desc: -1 | 1,
  sort: UserSort,
): Record<string, SortOrder> => {
  switch (sort) {
    case UserSort.LastName:
      return { lastName: Desc };
    case UserSort.CreatedAt:
      return { createdAt: Desc };
    case UserSort.UpdatedAt:
      return { updatedAt: Desc };
  }
};

export const getSeoSortOption = (
  Desc: -1 | 1,
  sort?: SeoSort,
): Record<string, SortOrder> => {
  if (!sort) return {};
  switch (sort) {
    case SeoSort.Title:
      return { title: Desc };
    case SeoSort.CreatedAt:
      return { createdAt: Desc };
    case SeoSort.UpdatedAt:
      return { updatedAt: Desc };
  }
};

export const getProductSortOption = (
  Desc: -1 | 1,
  sort?: ProductSort,
): Record<string, SortOrder> => {
  if (!sort) return {};
  switch (sort) {
    case ProductSort.Title:
      return { title: Desc };
    case ProductSort.CreatedAt:
      return { createdAt: Desc };
    case ProductSort.UpdatedAt:
      return { updatedAt: Desc };
    case ProductSort.Price:
      return { price: Desc };
  }
};
