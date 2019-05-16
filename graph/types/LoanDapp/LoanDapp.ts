import {
  EthereumCall,
  EthereumEvent,
  SmartContract,
  EthereumValue,
  JSONValue,
  TypedMap,
  Entity,
  EthereumTuple,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class SettlementCurrencyAdded extends EthereumEvent {
  get params(): SettlementCurrencyAdded__Params {
    return new SettlementCurrencyAdded__Params(this);
  }
}

export class SettlementCurrencyAdded__Params {
  _event: SettlementCurrencyAdded;

  constructor(event: SettlementCurrencyAdded) {
    this._event = event;
  }

  get id(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get settlementAddress(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class LoanApprovedForSettlement extends EthereumEvent {
  get params(): LoanApprovedForSettlement__Params {
    return new LoanApprovedForSettlement__Params(this);
  }
}

export class LoanApprovedForSettlement__Params {
  _event: LoanApprovedForSettlement;

  constructor(event: LoanApprovedForSettlement) {
    this._event = event;
  }

  get loanId(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class LoanCreated extends EthereumEvent {
  get params(): LoanCreated__Params {
    return new LoanCreated__Params(this);
  }
}

export class LoanCreated__Params {
  _event: LoanCreated;

  constructor(event: LoanCreated) {
    this._event = event;
  }

  get id(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get borrower(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get notional(): Bytes {
    return this._event.parameters[2].value.toBytes();
  }

  get borrowerPublicKey(): string {
    return this._event.parameters[3].value.toString();
  }

  get loanVariables(): Array<BigInt> {
    return this._event.parameters[4].value.toBigIntArray();
  }

  get createdAt(): BigInt {
    return this._event.parameters[5].value.toBigInt();
  }
}

export class ViewRequestCreated extends EthereumEvent {
  get params(): ViewRequestCreated__Params {
    return new ViewRequestCreated__Params(this);
  }
}

export class ViewRequestCreated__Params {
  _event: ViewRequestCreated;

  constructor(event: ViewRequestCreated) {
    this._event = event;
  }

  get loanId(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get lender(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get lenderPublicKey(): string {
    return this._event.parameters[2].value.toString();
  }
}

export class ViewRequestApproved extends EthereumEvent {
  get params(): ViewRequestApproved__Params {
    return new ViewRequestApproved__Params(this);
  }
}

export class ViewRequestApproved__Params {
  _event: ViewRequestApproved;

  constructor(event: ViewRequestApproved) {
    this._event = event;
  }

  get accessId(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get loanId(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get user(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get sharedSecret(): string {
    return this._event.parameters[3].value.toString();
  }
}

export class NoteAccessApproved extends EthereumEvent {
  get params(): NoteAccessApproved__Params {
    return new NoteAccessApproved__Params(this);
  }
}

export class NoteAccessApproved__Params {
  _event: NoteAccessApproved;

  constructor(event: NoteAccessApproved) {
    this._event = event;
  }

  get accessId(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get note(): Bytes {
    return this._event.parameters[1].value.toBytes();
  }

  get user(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get sharedSecret(): string {
    return this._event.parameters[3].value.toString();
  }
}

export class SettlementSuccesfull extends EthereumEvent {
  get params(): SettlementSuccesfull__Params {
    return new SettlementSuccesfull__Params(this);
  }
}

export class SettlementSuccesfull__Params {
  _event: SettlementSuccesfull;

  constructor(event: SettlementSuccesfull) {
    this._event = event;
  }

  get from(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get to(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get loanId(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get timestamp(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }
}

export class LoanDapp__loanPaymentsResult {
  value0: Address;
  value1: Address;
  value2: Bytes;

  constructor(value0: Address, value1: Address, value2: Bytes) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
  }

  toMap(): TypedMap<string, EthereumValue> {
    let map = new TypedMap<string, EthereumValue>();
    map.set("value0", EthereumValue.fromAddress(this.value0));
    map.set("value1", EthereumValue.fromAddress(this.value1));
    map.set("value2", EthereumValue.fromFixedBytes(this.value2));
    return map;
  }
}

export class LoanDapp extends SmartContract {
  static bind(address: Address): LoanDapp {
    return new LoanDapp("LoanDapp", address);
  }

  JOIN_SPLIT_PROOF(): i32 {
    let result = super.call("JOIN_SPLIT_PROOF", []);
    return result[0].toI32();
  }

  ZERO_VALUE_NOTE_HASH(): Bytes {
    let result = super.call("ZERO_VALUE_NOTE_HASH", []);
    return result[0].toBytes();
  }

  PRIVATE_RANGE_PROOF(): i32 {
    let result = super.call("PRIVATE_RANGE_PROOF", []);
    return result[0].toI32();
  }

  settlementCurrencies(param0: BigInt): Address {
    let result = super.call("settlementCurrencies", [
      EthereumValue.fromUnsignedBigInt(param0)
    ]);
    return result[0].toAddress();
  }

  MINT_PROOF(): i32 {
    let result = super.call("MINT_PROOF", []);
    return result[0].toI32();
  }

  loanPayments(param0: BigInt, param1: BigInt): LoanDapp__loanPaymentsResult {
    let result = super.call("loanPayments", [
      EthereumValue.fromUnsignedBigInt(param0),
      EthereumValue.fromUnsignedBigInt(param1)
    ]);
    return new LoanDapp__loanPaymentsResult(
      result[0].toAddress(),
      result[1].toAddress(),
      result[2].toBytes()
    );
  }

  BURN_PROOF(): i32 {
    let result = super.call("BURN_PROOF", []);
    return result[0].toI32();
  }

  loans(param0: BigInt): Address {
    let result = super.call("loans", [
      EthereumValue.fromUnsignedBigInt(param0)
    ]);
    return result[0].toAddress();
  }
}

export class ConstructorCall extends EthereumCall {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }

  get _aceAddress(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class AddSettlementCurrencyCall extends EthereumCall {
  get inputs(): AddSettlementCurrencyCall__Inputs {
    return new AddSettlementCurrencyCall__Inputs(this);
  }

  get outputs(): AddSettlementCurrencyCall__Outputs {
    return new AddSettlementCurrencyCall__Outputs(this);
  }
}

export class AddSettlementCurrencyCall__Inputs {
  _call: AddSettlementCurrencyCall;

  constructor(call: AddSettlementCurrencyCall) {
    this._call = call;
  }

  get _id(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get _address(): Address {
    return this._call.inputValues[1].value.toAddress();
  }
}

export class AddSettlementCurrencyCall__Outputs {
  _call: AddSettlementCurrencyCall;

  constructor(call: AddSettlementCurrencyCall) {
    this._call = call;
  }
}

export class CreateLoanCall extends EthereumCall {
  get inputs(): CreateLoanCall__Inputs {
    return new CreateLoanCall__Inputs(this);
  }

  get outputs(): CreateLoanCall__Outputs {
    return new CreateLoanCall__Outputs(this);
  }
}

export class CreateLoanCall__Inputs {
  _call: CreateLoanCall;

  constructor(call: CreateLoanCall) {
    this._call = call;
  }

  get _notional(): Bytes {
    return this._call.inputValues[0].value.toBytes();
  }

  get _viewingKey(): string {
    return this._call.inputValues[1].value.toString();
  }

  get _borrowerPublicKey(): string {
    return this._call.inputValues[2].value.toString();
  }

  get _loanVariables(): Array<BigInt> {
    return this._call.inputValues[3].value.toBigIntArray();
  }

  get _proofData(): Bytes {
    return this._call.inputValues[4].value.toBytes();
  }
}

export class CreateLoanCall__Outputs {
  _call: CreateLoanCall;

  constructor(call: CreateLoanCall) {
    this._call = call;
  }
}

export class ApproveLoanNotionalCall extends EthereumCall {
  get inputs(): ApproveLoanNotionalCall__Inputs {
    return new ApproveLoanNotionalCall__Inputs(this);
  }

  get outputs(): ApproveLoanNotionalCall__Outputs {
    return new ApproveLoanNotionalCall__Outputs(this);
  }
}

export class ApproveLoanNotionalCall__Inputs {
  _call: ApproveLoanNotionalCall;

  constructor(call: ApproveLoanNotionalCall) {
    this._call = call;
  }

  get _noteHash(): Bytes {
    return this._call.inputValues[0].value.toBytes();
  }

  get _signature(): Bytes {
    return this._call.inputValues[1].value.toBytes();
  }

  get _loanId(): Address {
    return this._call.inputValues[2].value.toAddress();
  }
}

export class ApproveLoanNotionalCall__Outputs {
  _call: ApproveLoanNotionalCall;

  constructor(call: ApproveLoanNotionalCall) {
    this._call = call;
  }
}

export class SubmitViewRequestCall extends EthereumCall {
  get inputs(): SubmitViewRequestCall__Inputs {
    return new SubmitViewRequestCall__Inputs(this);
  }

  get outputs(): SubmitViewRequestCall__Outputs {
    return new SubmitViewRequestCall__Outputs(this);
  }
}

export class SubmitViewRequestCall__Inputs {
  _call: SubmitViewRequestCall;

  constructor(call: SubmitViewRequestCall) {
    this._call = call;
  }

  get _loanId(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _lenderPublicKey(): string {
    return this._call.inputValues[1].value.toString();
  }
}

export class SubmitViewRequestCall__Outputs {
  _call: SubmitViewRequestCall;

  constructor(call: SubmitViewRequestCall) {
    this._call = call;
  }
}

export class ApproveViewRequestCall extends EthereumCall {
  get inputs(): ApproveViewRequestCall__Inputs {
    return new ApproveViewRequestCall__Inputs(this);
  }

  get outputs(): ApproveViewRequestCall__Outputs {
    return new ApproveViewRequestCall__Outputs(this);
  }
}

export class ApproveViewRequestCall__Inputs {
  _call: ApproveViewRequestCall;

  constructor(call: ApproveViewRequestCall) {
    this._call = call;
  }

  get _loanId(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _lender(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get _notionalNote(): Bytes {
    return this._call.inputValues[2].value.toBytes();
  }

  get _sharedSecret(): string {
    return this._call.inputValues[3].value.toString();
  }
}

export class ApproveViewRequestCall__Outputs {
  _call: ApproveViewRequestCall;

  constructor(call: ApproveViewRequestCall) {
    this._call = call;
  }
}

export class SettleInitialBalanceCall extends EthereumCall {
  get inputs(): SettleInitialBalanceCall__Inputs {
    return new SettleInitialBalanceCall__Inputs(this);
  }

  get outputs(): SettleInitialBalanceCall__Outputs {
    return new SettleInitialBalanceCall__Outputs(this);
  }
}

export class SettleInitialBalanceCall__Inputs {
  _call: SettleInitialBalanceCall;

  constructor(call: SettleInitialBalanceCall) {
    this._call = call;
  }

  get _loanId(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _proofData(): Bytes {
    return this._call.inputValues[1].value.toBytes();
  }

  get _currentInterestBalance(): Bytes {
    return this._call.inputValues[2].value.toBytes();
  }
}

export class SettleInitialBalanceCall__Outputs {
  _call: SettleInitialBalanceCall;

  constructor(call: SettleInitialBalanceCall) {
    this._call = call;
  }
}

export class ApproveNoteAccessCall extends EthereumCall {
  get inputs(): ApproveNoteAccessCall__Inputs {
    return new ApproveNoteAccessCall__Inputs(this);
  }

  get outputs(): ApproveNoteAccessCall__Outputs {
    return new ApproveNoteAccessCall__Outputs(this);
  }
}

export class ApproveNoteAccessCall__Inputs {
  _call: ApproveNoteAccessCall;

  constructor(call: ApproveNoteAccessCall) {
    this._call = call;
  }

  get _note(): Bytes {
    return this._call.inputValues[0].value.toBytes();
  }

  get _viewingKey(): string {
    return this._call.inputValues[1].value.toString();
  }

  get _sharedSecret(): string {
    return this._call.inputValues[2].value.toString();
  }

  get _sharedWith(): Address {
    return this._call.inputValues[3].value.toAddress();
  }
}

export class ApproveNoteAccessCall__Outputs {
  _call: ApproveNoteAccessCall;

  constructor(call: ApproveNoteAccessCall) {
    this._call = call;
  }
}
