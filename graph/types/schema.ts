import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Address,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class Note extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Note entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Note entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Note", id.toString(), this);
  }

  static load(id: string): Note | null {
    return store.get("Note", id) as Note | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get ownerAddress(): Bytes {
    let value = this.get("ownerAddress");
    return value.toBytes();
  }

  set ownerAddress(value: Bytes) {
    this.set("ownerAddress", Value.fromBytes(value));
  }

  get currencyAddress(): Bytes {
    let value = this.get("currencyAddress");
    return value.toBytes();
  }

  set currencyAddress(value: Bytes) {
    this.set("currencyAddress", Value.fromBytes(value));
  }

  get access(): Array<string> | null {
    let value = this.get("access");
    if (value === null) {
      return null;
    } else {
      return value.toStringArray();
    }
  }

  set access(value: Array<string> | null) {
    if (value === null) {
      this.unset("access");
    } else {
      this.set("access", Value.fromStringArray(value as Array<string>));
    }
  }

  get status(): string {
    let value = this.get("status");
    return value.toString();
  }

  set status(value: string) {
    this.set("status", Value.fromString(value));
  }
}

export class NoteAccess extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save NoteAccess entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save NoteAccess entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("NoteAccess", id.toString(), this);
  }

  static load(id: string): NoteAccess | null {
    return store.get("NoteAccess", id) as NoteAccess | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get note(): string {
    let value = this.get("note");
    return value.toString();
  }

  set note(value: string) {
    this.set("note", Value.fromString(value));
  }

  get user(): string {
    let value = this.get("user");
    return value.toString();
  }

  set user(value: string) {
    this.set("user", Value.fromString(value));
  }

  get sharedSecret(): string {
    let value = this.get("sharedSecret");
    return value.toString();
  }

  set sharedSecret(value: string) {
    this.set("sharedSecret", Value.fromString(value));
  }
}

export class Loan extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Loan entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Loan entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Loan", id.toString(), this);
  }

  static load(id: string): Loan | null {
    return store.get("Loan", id) as Loan | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get notional(): Bytes {
    let value = this.get("notional");
    return value.toBytes();
  }

  set notional(value: Bytes) {
    this.set("notional", Value.fromBytes(value));
  }

  get viewingKey(): string {
    let value = this.get("viewingKey");
    return value.toString();
  }

  set viewingKey(value: string) {
    this.set("viewingKey", Value.fromString(value));
  }

  get borrower(): string {
    let value = this.get("borrower");
    return value.toString();
  }

  set borrower(value: string) {
    this.set("borrower", Value.fromString(value));
  }

  get lender(): string | null {
    let value = this.get("lender");
    if (value === null) {
      return null;
    } else {
      return value.toString();
    }
  }

  set lender(value: string | null) {
    if (value === null) {
      this.unset("lender");
    } else {
      this.set("lender", Value.fromString(value as string));
    }
  }

  get interestPeriod(): BigInt {
    let value = this.get("interestPeriod");
    return value.toBigInt();
  }

  set interestPeriod(value: BigInt) {
    this.set("interestPeriod", Value.fromBigInt(value));
  }

  get interestRate(): BigInt {
    let value = this.get("interestRate");
    return value.toBigInt();
  }

  set interestRate(value: BigInt) {
    this.set("interestRate", Value.fromBigInt(value));
  }

  get loanDuration(): BigInt {
    let value = this.get("loanDuration");
    return value.toBigInt();
  }

  set loanDuration(value: BigInt) {
    this.set("loanDuration", Value.fromBigInt(value));
  }

  get settlementCurrencyId(): BigInt {
    let value = this.get("settlementCurrencyId");
    return value.toBigInt();
  }

  set settlementCurrencyId(value: BigInt) {
    this.set("settlementCurrencyId", Value.fromBigInt(value));
  }

  get createdAt(): BigInt {
    let value = this.get("createdAt");
    return value.toBigInt();
  }

  set createdAt(value: BigInt) {
    this.set("createdAt", Value.fromBigInt(value));
  }

  get settledAt(): BigInt | null {
    let value = this.get("settledAt");
    if (value === null) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set settledAt(value: BigInt | null) {
    if (value === null) {
      this.unset("settledAt");
    } else {
      this.set("settledAt", Value.fromBigInt(value as BigInt));
    }
  }

  get repaidAt(): BigInt | null {
    let value = this.get("repaidAt");
    if (value === null) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set repaidAt(value: BigInt | null) {
    if (value === null) {
      this.unset("repaidAt");
    } else {
      this.set("repaidAt", Value.fromBigInt(value as BigInt));
    }
  }

  get lastInterestWithdrawAt(): BigInt | null {
    let value = this.get("lastInterestWithdrawAt");
    if (value === null) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set lastInterestWithdrawAt(value: BigInt | null) {
    if (value === null) {
      this.unset("lastInterestWithdrawAt");
    } else {
      this.set("lastInterestWithdrawAt", Value.fromBigInt(value as BigInt));
    }
  }

  get status(): string {
    let value = this.get("status");
    return value.toString();
  }

  set status(value: string) {
    this.set("status", Value.fromString(value));
  }

  get lenderAccess(): Array<string> | null {
    let value = this.get("lenderAccess");
    if (value === null) {
      return null;
    } else {
      return value.toStringArray();
    }
  }

  set lenderAccess(value: Array<string> | null) {
    if (value === null) {
      this.unset("lenderAccess");
    } else {
      this.set("lenderAccess", Value.fromStringArray(value as Array<string>));
    }
  }

  get balance(): Array<string> | null {
    let value = this.get("balance");
    if (value === null) {
      return null;
    } else {
      return value.toStringArray();
    }
  }

  set balance(value: Array<string> | null) {
    if (value === null) {
      this.unset("balance");
    } else {
      this.set("balance", Value.fromStringArray(value as Array<string>));
    }
  }
}

export class User extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save User entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save User entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("User", id.toString(), this);
  }

  static load(id: string): User | null {
    return store.get("User", id) as User | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get address(): Bytes {
    let value = this.get("address");
    return value.toBytes();
  }

  set address(value: Bytes) {
    this.set("address", Value.fromBytes(value));
  }

  get publicKey(): string | null {
    let value = this.get("publicKey");
    if (value === null) {
      return null;
    } else {
      return value.toString();
    }
  }

  set publicKey(value: string | null) {
    if (value === null) {
      this.unset("publicKey");
    } else {
      this.set("publicKey", Value.fromString(value as string));
    }
  }

  get loans(): Array<string> | null {
    let value = this.get("loans");
    if (value === null) {
      return null;
    } else {
      return value.toStringArray();
    }
  }

  set loans(value: Array<string> | null) {
    if (value === null) {
      this.unset("loans");
    } else {
      this.set("loans", Value.fromStringArray(value as Array<string>));
    }
  }

  get approvedLoans(): Array<string> | null {
    let value = this.get("approvedLoans");
    if (value === null) {
      return null;
    } else {
      return value.toStringArray();
    }
  }

  set approvedLoans(value: Array<string> | null) {
    if (value === null) {
      this.unset("approvedLoans");
    } else {
      this.set("approvedLoans", Value.fromStringArray(value as Array<string>));
    }
  }

  get settledLoans(): Array<string> | null {
    let value = this.get("settledLoans");
    if (value === null) {
      return null;
    } else {
      return value.toStringArray();
    }
  }

  set settledLoans(value: Array<string> | null) {
    if (value === null) {
      this.unset("settledLoans");
    } else {
      this.set("settledLoans", Value.fromStringArray(value as Array<string>));
    }
  }

  get balance(): Array<string> | null {
    let value = this.get("balance");
    if (value === null) {
      return null;
    } else {
      return value.toStringArray();
    }
  }

  set balance(value: Array<string> | null) {
    if (value === null) {
      this.unset("balance");
    } else {
      this.set("balance", Value.fromStringArray(value as Array<string>));
    }
  }

  get balanceAccess(): Array<string> | null {
    let value = this.get("balanceAccess");
    if (value === null) {
      return null;
    } else {
      return value.toStringArray();
    }
  }

  set balanceAccess(value: Array<string> | null) {
    if (value === null) {
      this.unset("balanceAccess");
    } else {
      this.set("balanceAccess", Value.fromStringArray(value as Array<string>));
    }
  }
}

export class LenderAccess extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save LenderAccess entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save LenderAccess entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("LenderAccess", id.toString(), this);
  }

  static load(id: string): LenderAccess | null {
    return store.get("LenderAccess", id) as LenderAccess | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get loan(): string {
    let value = this.get("loan");
    return value.toString();
  }

  set loan(value: string) {
    this.set("loan", Value.fromString(value));
  }

  get lender(): string {
    let value = this.get("lender");
    return value.toString();
  }

  set lender(value: string) {
    this.set("lender", Value.fromString(value));
  }

  get lenderPublicKey(): string {
    let value = this.get("lenderPublicKey");
    return value.toString();
  }

  set lenderPublicKey(value: string) {
    this.set("lenderPublicKey", Value.fromString(value));
  }

  get sharedSecret(): string | null {
    let value = this.get("sharedSecret");
    if (value === null) {
      return null;
    } else {
      return value.toString();
    }
  }

  set sharedSecret(value: string | null) {
    if (value === null) {
      this.unset("sharedSecret");
    } else {
      this.set("sharedSecret", Value.fromString(value as string));
    }
  }
}
