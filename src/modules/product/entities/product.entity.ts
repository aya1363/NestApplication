import { IProduct } from "src/common";

export class ProductResponse {
    product:IProduct
}
export class GetAllProductResponse {
    result: {
currentPage: number | 'all';
pages?: number;
limit?: number;
docsCount?: number;
result: IProduct[] ;
}}