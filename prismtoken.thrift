namespace js PrismToken

struct SessionOptions {
  1: string version
}

struct SignInResponse {
  1: string token,
  2: i64 expiry
}

struct MeterConfigIn {
  1: required string drn,
  2: required i16 ea,
  3: required i16 tct,
  10: required i32 Sgc,
  11: required i16 Krn,
  12: required i16 Ti,
  30: required i16 ken
}

struct MeterConfigAmendment {
  1: required i32 toSgc    // Nouveau SupplyGroupCode, 0-999999
  2: required i16 toKrn    // Nouveau KeyRevisionNumber, 1-9
  3: required i16 toTi     // Nouveau TariffIndex, 0-99
}


exception ApiException {
  1: string message
}

struct Token {
  1: required string drn
  2: required string pan
  3: required i16 ea
  4: required i16 tct
  5: required i32 sgc
  6: required i16 krn
  7: required i16 ti
  10: required i16 tokenClass
  11: required i16 subclass
  12: required i32 tid
  13: required double transferAmount
  14: required bool isReservedTid
  20: required string description
  21: required string stsUnitName
  22: required string scaledAmount
  23: required string scaledUnitName
  30: required string tokenDec
  31: required string tokenHex
  40: required string idSm
}

service TokenApi {
  SignInResponse signInWithPassword(
    1: string messageId,
    2: string domain,
    3: string username,
    4: string password,
    5: SessionOptions sessionOpts
  )

  list<Token> issueCreditToken(
    1: string messageId,
    2: string accessToken,
    3: MeterConfigIn meterConfig,
    4: i16 subclass,
    5: double transferAmount,
    6: i64 tokenTime,
    7: i64 flags
  ) throws (
    1: ApiException ex
  )
   list<Token> issueMseToken(
    1: string messageId,
    2: string accessToken,
    3: MeterConfigIn meterConfig,
    4: i16 subclass,
    5: double transferAmount,
    6: i64 tokenTime,
    7: i64 flags
  ) throws (
    1: ApiException ex
  )
  list<Token> issueKeyChangeTokens(
  1: string messageId,
  2: string accessToken,
  3: MeterConfigIn meterConfig,
  4: MeterConfigAmendment newConfig
) throws (
  1: ApiException ex
)
}
