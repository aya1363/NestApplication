export enum OrderStatusEnum{
    Pending = 0,
    placed = 1,
    onWay = 2,
    delivered = 3,
    canceled = 4,
}
export enum OrderStatusNameEnum{
    Pending = 'pending',
    placed = 'placed',
    onWay = 'onWay',
    canceled = 'canceled',
    delivered='delivered'
}

export enum PaymentEnumType {
    cash = 'cash',
    card = 'card'
}