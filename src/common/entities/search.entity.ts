export class GetAllResponse <T=any>{
    result: {
currentPage: number | 'all';
pages?: number;
limit?: number;
docsCount?: number;
result: T[] ;
}}