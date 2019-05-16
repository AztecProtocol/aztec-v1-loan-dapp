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

export class LoanPayment extends EthereumEvent {
  get params(): LoanPayment__Params {
    return new LoanPayment__Params(this);
  }
}

export class LoanPayment__Params {
  _event: LoanPayment;

  constructor(event: LoanPayment) {
    this._event = event;
  }

  get paymentType(): string {
    return this._event.parameters[0].value.toString();
  }

  get lastInterestPaymentDate(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class LoanDefault extends EthereumEvent {
  get params(): LoanDefault__Params {
    return new LoanDefault__Params(this);
  }
}

export class LoanDefault__Params {
  _event: LoanDefault;

  constructor(event: LoanDefault) {
    this._event = event;
  }
}

export class LoanRepaid extends EthereumEvent {
  get params(): LoanRepaid__Params {
    return new LoanRepaid__Params(this);
  }
}

export class LoanRepaid__Params {
  _event: LoanRepaid;

  constructor(event: LoanRepaid) {
    this._event = event;
  }
}

export class UpdateTotalMinted extends EthereumEvent {
  get params(): UpdateTotalMinted__Params {
    return new UpdateTotalMinted__Params(this);
  }
}

export class UpdateTotalMinted__Params {
  _event: UpdateTotalMinted;

  constructor(event: UpdateTotalMinted) {
    this._event = event;
  }

  get noteHash(): Bytes {
    return this._event.parameters[0].value.toBytes();
  }

  get noteData(): Bytes {
    return this._event.parameters[1].value.toBytes();
  }
}

export class CreateZkAsset extends EthereumEvent {
  get params(): CreateZkAsset__Params {
    return new CreateZkAsset__Params(this);
  }
}

export class CreateZkAsset__Params {
  _event: CreateZkAsset;

  constructor(event: CreateZkAsset) {
    this._event = event;
  }

  get aceAddress(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get linkedTokenAddress(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get scalingFactor(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }

  get _canAdjustSupply(): boolean {
    return this._event.parameters[3].value.toBoolean();
  }

  get _canConvert(): boolean {
    return this._event.parameters[4].value.toBoolean();
  }
}

export class CreateNoteRegistry extends EthereumEvent {
  get params(): CreateNoteRegistry__Params {
    return new CreateNoteRegistry__Params(this);
  }
}

export class CreateNoteRegistry__Params {
  _event: CreateNoteRegistry;

  constructor(event: CreateNoteRegistry) {
    this._event = event;
  }

  get noteRegistryId(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }
}

export class CreateNote extends EthereumEvent {
  get params(): CreateNote__Params {
    return new CreateNote__Params(this);
  }
}

export class CreateNote__Params {
  _event: CreateNote;

  constructor(event: CreateNote) {
    this._event = event;
  }

  get owner(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get noteHash(): Bytes {
    return this._event.parameters[1].value.toBytes();
  }

  get metadata(): Bytes {
    return this._event.parameters[2].value.toBytes();
  }
}

export class DestroyNote extends EthereumEvent {
  get params(): DestroyNote__Params {
    return new DestroyNote__Params(this);
  }
}

export class DestroyNote__Params {
  _event: DestroyNote;

  constructor(event: DestroyNote) {
    this._event = event;
  }

  get owner(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get noteHash(): Bytes {
    return this._event.parameters[1].value.toBytes();
  }

  get metadata(): Bytes {
    return this._event.parameters[2].value.toBytes();
  }
}

export class ConvertTokens extends EthereumEvent {
  get params(): ConvertTokens__Params {
    return new ConvertTokens__Params(this);
  }
}

export class ConvertTokens__Params {
  _event: ConvertTokens;

  constructor(event: ConvertTokens) {
    this._event = event;
  }

  get owner(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get value(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class RedeemTokens extends EthereumEvent {
  get params(): RedeemTokens__Params {
    return new RedeemTokens__Params(this);
  }
}

export class RedeemTokens__Params {
  _event: RedeemTokens;

  constructor(event: RedeemTokens) {
    this._event = event;
  }

  get owner(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get value(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class Loan__flagsResult {
  value0: boolean;
  value1: boolean;
  value2: boolean;

  constructor(value0: boolean, value1: boolean, value2: boolean) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
  }

  toMap(): TypedMap<string, EthereumValue> {
    let map = new TypedMap<string, EthereumValue>();
    map.set("value0", EthereumValue.fromBoolean(this.value0));
    map.set("value1", EthereumValue.fromBoolean(this.value1));
    map.set("value2", EthereumValue.fromBoolean(this.value2));
    return map;
  }
}

export class Loan__loanVariablesResult {
  value0: BigInt;
  value1: BigInt;
  value2: BigInt;
  value3: BigInt;
  value4: BigInt;
  value5: Bytes;
  value6: Bytes;
  value7: Address;
  value8: Address;
  value9: Address;
  value10: Address;
  value11: Address;
  value12: Address;

  constructor(
    value0: BigInt,
    value1: BigInt,
    value2: BigInt,
    value3: BigInt,
    value4: BigInt,
    value5: Bytes,
    value6: Bytes,
    value7: Address,
    value8: Address,
    value9: Address,
    value10: Address,
    value11: Address,
    value12: Address
  ) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
    this.value3 = value3;
    this.value4 = value4;
    this.value5 = value5;
    this.value6 = value6;
    this.value7 = value7;
    this.value8 = value8;
    this.value9 = value9;
    this.value10 = value10;
    this.value11 = value11;
    this.value12 = value12;
  }

  toMap(): TypedMap<string, EthereumValue> {
    let map = new TypedMap<string, EthereumValue>();
    map.set("value0", EthereumValue.fromUnsignedBigInt(this.value0));
    map.set("value1", EthereumValue.fromUnsignedBigInt(this.value1));
    map.set("value2", EthereumValue.fromUnsignedBigInt(this.value2));
    map.set("value3", EthereumValue.fromUnsignedBigInt(this.value3));
    map.set("value4", EthereumValue.fromUnsignedBigInt(this.value4));
    map.set("value5", EthereumValue.fromFixedBytes(this.value5));
    map.set("value6", EthereumValue.fromFixedBytes(this.value6));
    map.set("value7", EthereumValue.fromAddress(this.value7));
    map.set("value8", EthereumValue.fromAddress(this.value8));
    map.set("value9", EthereumValue.fromAddress(this.value9));
    map.set("value10", EthereumValue.fromAddress(this.value10));
    map.set("value11", EthereumValue.fromAddress(this.value11));
    map.set("value12", EthereumValue.fromAddress(this.value12));
    return map;
  }
}

export class Loan extends SmartContract {
  static bind(address: Address): Loan {
    return new Loan("Loan", address);
  }

  JOIN_SPLIT_PROOF(): i32 {
    let result = super.call("JOIN_SPLIT_PROOF", []);
    return result[0].toI32();
  }

  ZERO_VALUE_NOTE_HASH(): Bytes {
    let result = super.call("ZERO_VALUE_NOTE_HASH", []);
    return result[0].toBytes();
  }

  confidentialApproved(param0: Bytes, param1: Address): boolean {
    let result = super.call("confidentialApproved", [
      EthereumValue.fromFixedBytes(param0),
      EthereumValue.fromAddress(param1)
    ]);
    return result[0].toBoolean();
  }

  PRIVATE_RANGE_PROOF(): i32 {
    let result = super.call("PRIVATE_RANGE_PROOF", []);
    return result[0].toI32();
  }

  flags(): Loan__flagsResult {
    let result = super.call("flags", []);
    return new Loan__flagsResult(
      result[0].toBoolean(),
      result[1].toBoolean(),
      result[2].toBoolean()
    );
  }

  proofs(param0: i32): BigInt {
    let result = super.call("proofs", [EthereumValue.fromI32(param0)]);
    return result[0].toBigInt();
  }

  settlementToken(): Address {
    let result = super.call("settlementToken", []);
    return result[0].toAddress();
  }

  borrower(): Address {
    let result = super.call("borrower", []);
    return result[0].toAddress();
  }

  supportsProof(_proof: i32): boolean {
    let result = super.call("supportsProof", [EthereumValue.fromI32(_proof)]);
    return result[0].toBoolean();
  }

  loanVariables(): Loan__loanVariablesResult {
    let result = super.call("loanVariables", []);
    return new Loan__loanVariablesResult(
      result[0].toBigInt(),
      result[1].toBigInt(),
      result[2].toBigInt(),
      result[3].toBigInt(),
      result[4].toBigInt(),
      result[5].toBytes(),
      result[6].toBytes(),
      result[7].toAddress(),
      result[8].toAddress(),
      result[9].toAddress(),
      result[10].toAddress(),
      result[11].toAddress(),
      result[12].toAddress()
    );
  }

  owner(): Address {
    let result = super.call("owner", []);
    return result[0].toAddress();
  }

  MINT_PROOF(): i32 {
    let result = super.call("MINT_PROOF", []);
    return result[0].toI32();
  }

  ace(): Address {
    let result = super.call("ace", []);
    return result[0].toAddress();
  }

  lender(): Address {
    let result = super.call("lender", []);
    return result[0].toAddress();
  }

  BURN_PROOF(): i32 {
    let result = super.call("BURN_PROOF", []);
    return result[0].toI32();
  }

  EIP712_DOMAIN_HASH(): Bytes {
    let result = super.call("EIP712_DOMAIN_HASH", []);
    return result[0].toBytes();
  }

  linkedToken(): Address {
    let result = super.call("linkedToken", []);
    return result[0].toAddress();
  }

  scalingFactor(): BigInt {
    let result = super.call("scalingFactor", []);
    return result[0].toBigInt();
  }
}

export class ConfidentialApproveCall extends EthereumCall {
  get inputs(): ConfidentialApproveCall__Inputs {
    return new ConfidentialApproveCall__Inputs(this);
  }

  get outputs(): ConfidentialApproveCall__Outputs {
    return new ConfidentialApproveCall__Outputs(this);
  }
}

export class ConfidentialApproveCall__Inputs {
  _call: ConfidentialApproveCall;

  constructor(call: ConfidentialApproveCall) {
    this._call = call;
  }

  get _noteHash(): Bytes {
    return this._call.inputValues[0].value.toBytes();
  }

  get _spender(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get _status(): boolean {
    return this._call.inputValues[2].value.toBoolean();
  }

  get _signature(): Bytes {
    return this._call.inputValues[3].value.toBytes();
  }
}

export class ConfidentialApproveCall__Outputs {
  _call: ConfidentialApproveCall;

  constructor(call: ConfidentialApproveCall) {
    this._call = call;
  }
}

export class SetProofsCall extends EthereumCall {
  get inputs(): SetProofsCall__Inputs {
    return new SetProofsCall__Inputs(this);
  }

  get outputs(): SetProofsCall__Outputs {
    return new SetProofsCall__Outputs(this);
  }
}

export class SetProofsCall__Inputs {
  _call: SetProofsCall;

  constructor(call: SetProofsCall) {
    this._call = call;
  }

  get _epoch(): i32 {
    return this._call.inputValues[0].value.toI32();
  }

  get _proofs(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class SetProofsCall__Outputs {
  _call: SetProofsCall;

  constructor(call: SetProofsCall) {
    this._call = call;
  }
}

export class ConfidentialTransferCall extends EthereumCall {
  get inputs(): ConfidentialTransferCall__Inputs {
    return new ConfidentialTransferCall__Inputs(this);
  }

  get outputs(): ConfidentialTransferCall__Outputs {
    return new ConfidentialTransferCall__Outputs(this);
  }
}

export class ConfidentialTransferCall__Inputs {
  _call: ConfidentialTransferCall;

  constructor(call: ConfidentialTransferCall) {
    this._call = call;
  }

  get _proofData(): Bytes {
    return this._call.inputValues[0].value.toBytes();
  }

  get _signatures(): Bytes {
    return this._call.inputValues[1].value.toBytes();
  }
}

export class ConfidentialTransferCall__Outputs {
  _call: ConfidentialTransferCall;

  constructor(call: ConfidentialTransferCall) {
    this._call = call;
  }
}

export class ConfidentialTransferFromCall extends EthereumCall {
  get inputs(): ConfidentialTransferFromCall__Inputs {
    return new ConfidentialTransferFromCall__Inputs(this);
  }

  get outputs(): ConfidentialTransferFromCall__Outputs {
    return new ConfidentialTransferFromCall__Outputs(this);
  }
}

export class ConfidentialTransferFromCall__Inputs {
  _call: ConfidentialTransferFromCall;

  constructor(call: ConfidentialTransferFromCall) {
    this._call = call;
  }

  get _proof(): i32 {
    return this._call.inputValues[0].value.toI32();
  }

  get _proofOutput(): Bytes {
    return this._call.inputValues[1].value.toBytes();
  }
}

export class ConfidentialTransferFromCall__Outputs {
  _call: ConfidentialTransferFromCall;

  constructor(call: ConfidentialTransferFromCall) {
    this._call = call;
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

  get _notional(): Bytes {
    return this._call.inputValues[0].value.toBytes();
  }

  get _loanVariables(): Array<BigInt> {
    return this._call.inputValues[1].value.toBigIntArray();
  }

  get _borrower(): Address {
    return this._call.inputValues[2].value.toAddress();
  }

  get _aceAddress(): Address {
    return this._call.inputValues[3].value.toAddress();
  }

  get _settlementCurrency(): Address {
    return this._call.inputValues[4].value.toAddress();
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class RequestAccessCall extends EthereumCall {
  get inputs(): RequestAccessCall__Inputs {
    return new RequestAccessCall__Inputs(this);
  }

  get outputs(): RequestAccessCall__Outputs {
    return new RequestAccessCall__Outputs(this);
  }
}

export class RequestAccessCall__Inputs {
  _call: RequestAccessCall;

  constructor(call: RequestAccessCall) {
    this._call = call;
  }
}

export class RequestAccessCall__Outputs {
  _call: RequestAccessCall;

  constructor(call: RequestAccessCall) {
    this._call = call;
  }
}

export class ApproveAccessCall extends EthereumCall {
  get inputs(): ApproveAccessCall__Inputs {
    return new ApproveAccessCall__Inputs(this);
  }

  get outputs(): ApproveAccessCall__Outputs {
    return new ApproveAccessCall__Outputs(this);
  }
}

export class ApproveAccessCall__Inputs {
  _call: ApproveAccessCall;

  constructor(call: ApproveAccessCall) {
    this._call = call;
  }

  get _lender(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _sharedSecret(): Bytes {
    return this._call.inputValues[1].value.toBytes();
  }
}

export class ApproveAccessCall__Outputs {
  _call: ApproveAccessCall;

  constructor(call: ApproveAccessCall) {
    this._call = call;
  }
}

export class SettleLoanCall extends EthereumCall {
  get inputs(): SettleLoanCall__Inputs {
    return new SettleLoanCall__Inputs(this);
  }

  get outputs(): SettleLoanCall__Outputs {
    return new SettleLoanCall__Outputs(this);
  }
}

export class SettleLoanCall__Inputs {
  _call: SettleLoanCall;

  constructor(call: SettleLoanCall) {
    this._call = call;
  }

  get _proofData(): Bytes {
    return this._call.inputValues[0].value.toBytes();
  }

  get _currentInterestBalance(): Bytes {
    return this._call.inputValues[1].value.toBytes();
  }

  get _lender(): Address {
    return this._call.inputValues[2].value.toAddress();
  }
}

export class SettleLoanCall__Outputs {
  _call: SettleLoanCall;

  constructor(call: SettleLoanCall) {
    this._call = call;
  }
}

export class ConfidentialMintCall extends EthereumCall {
  get inputs(): ConfidentialMintCall__Inputs {
    return new ConfidentialMintCall__Inputs(this);
  }

  get outputs(): ConfidentialMintCall__Outputs {
    return new ConfidentialMintCall__Outputs(this);
  }
}

export class ConfidentialMintCall__Inputs {
  _call: ConfidentialMintCall;

  constructor(call: ConfidentialMintCall) {
    this._call = call;
  }

  get _proof(): i32 {
    return this._call.inputValues[0].value.toI32();
  }

  get _proofData(): Bytes {
    return this._call.inputValues[1].value.toBytes();
  }
}

export class ConfidentialMintCall__Outputs {
  _call: ConfidentialMintCall;

  constructor(call: ConfidentialMintCall) {
    this._call = call;
  }
}

export class WithdrawInterestCall extends EthereumCall {
  get inputs(): WithdrawInterestCall__Inputs {
    return new WithdrawInterestCall__Inputs(this);
  }

  get outputs(): WithdrawInterestCall__Outputs {
    return new WithdrawInterestCall__Outputs(this);
  }
}

export class WithdrawInterestCall__Inputs {
  _call: WithdrawInterestCall;

  constructor(call: WithdrawInterestCall) {
    this._call = call;
  }

  get _proof1(): Bytes {
    return this._call.inputValues[0].value.toBytes();
  }

  get _proof2(): Bytes {
    return this._call.inputValues[1].value.toBytes();
  }

  get _interestDurationToWithdraw(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }
}

export class WithdrawInterestCall__Outputs {
  _call: WithdrawInterestCall;

  constructor(call: WithdrawInterestCall) {
    this._call = call;
  }
}

export class AdjustInterestBalanceCall extends EthereumCall {
  get inputs(): AdjustInterestBalanceCall__Inputs {
    return new AdjustInterestBalanceCall__Inputs(this);
  }

  get outputs(): AdjustInterestBalanceCall__Outputs {
    return new AdjustInterestBalanceCall__Outputs(this);
  }
}

export class AdjustInterestBalanceCall__Inputs {
  _call: AdjustInterestBalanceCall;

  constructor(call: AdjustInterestBalanceCall) {
    this._call = call;
  }

  get _proofData(): Bytes {
    return this._call.inputValues[0].value.toBytes();
  }
}

export class AdjustInterestBalanceCall__Outputs {
  _call: AdjustInterestBalanceCall;

  constructor(call: AdjustInterestBalanceCall) {
    this._call = call;
  }
}

export class RepayLoanCall extends EthereumCall {
  get inputs(): RepayLoanCall__Inputs {
    return new RepayLoanCall__Inputs(this);
  }

  get outputs(): RepayLoanCall__Outputs {
    return new RepayLoanCall__Outputs(this);
  }
}

export class RepayLoanCall__Inputs {
  _call: RepayLoanCall;

  constructor(call: RepayLoanCall) {
    this._call = call;
  }

  get _proof1(): Bytes {
    return this._call.inputValues[0].value.toBytes();
  }

  get _proof2(): Bytes {
    return this._call.inputValues[1].value.toBytes();
  }
}

export class RepayLoanCall__Outputs {
  _call: RepayLoanCall;

  constructor(call: RepayLoanCall) {
    this._call = call;
  }
}

export class MarkLoanAsDefaultCall extends EthereumCall {
  get inputs(): MarkLoanAsDefaultCall__Inputs {
    return new MarkLoanAsDefaultCall__Inputs(this);
  }

  get outputs(): MarkLoanAsDefaultCall__Outputs {
    return new MarkLoanAsDefaultCall__Outputs(this);
  }
}

export class MarkLoanAsDefaultCall__Inputs {
  _call: MarkLoanAsDefaultCall;

  constructor(call: MarkLoanAsDefaultCall) {
    this._call = call;
  }

  get _proof1(): Bytes {
    return this._call.inputValues[0].value.toBytes();
  }

  get _proof2(): Bytes {
    return this._call.inputValues[1].value.toBytes();
  }

  get _interestDurationToWithdraw(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }
}

export class MarkLoanAsDefaultCall__Outputs {
  _call: MarkLoanAsDefaultCall;

  constructor(call: MarkLoanAsDefaultCall) {
    this._call = call;
  }
}
