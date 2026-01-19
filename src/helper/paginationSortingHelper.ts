type IOptions = {
  page?: number | string | undefined;
  limit?: number | string | undefined;
  sortOrder?: string | undefined;
  sortBy?: string | undefined;
};

interface IPaginationSortHelperR {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
}

const paginationSortingHelper = (options: IOptions): IPaginationSortHelperR => {
  if (
    typeof Number(options.page) !== "number" &&
    typeof Number(options.limit)
  ) {
    throw new Error("the page value must be a number");
  }
  const page = Number(options.page ?? 1);
  const limit = Number(options.limit ?? 5);

  const sortBy = options.sortBy ?? "title";
  const sortOrder = options.sortOrder ?? "asc";

  return {
    page,
    limit,
    sortBy,
    sortOrder,
  };
};

export default paginationSortingHelper;
