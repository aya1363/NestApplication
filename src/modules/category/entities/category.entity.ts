import { ICategory } from "src/common";

export class CategoryResponse {
    category:ICategory
}


export class GetAllCategoryResponse {
    result: {
currentPage: number | 'all';
pages?: number;
limit?: number;
docsCount?: number;
result: ICategory[] ;
}}