import { Address, DataSourceTemplate } from "@graphprotocol/graph-ts";

export class Loan extends DataSourceTemplate {
  static create(address: Address): void {
    DataSourceTemplate.create("Loan", [address.toHex()]);
  }
}

export class ZKERC20 extends DataSourceTemplate {
  static create(address: Address): void {
    DataSourceTemplate.create("ZKERC20", [address.toHex()]);
  }
}
