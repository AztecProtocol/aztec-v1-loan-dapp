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

export class LoanPayment extends SmartContract {
  static bind(address: Address): LoanPayment {
    return new LoanPayment("LoanPayment", address);
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
