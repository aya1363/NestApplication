import { IBrand } from "src/common";

export class BrandResponse {
    brand:IBrand
}

export class GetAllResponse {result:{
currentPage: number | 'all';
pages?: number;
limit?: number;
docsCount?: number;
result: IBrand[] ;
}}
