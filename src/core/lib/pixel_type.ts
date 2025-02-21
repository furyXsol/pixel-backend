export type Pixel = {
  "version": "0.1.0",
  "name": "pixel",
  "instructions": [
    {
      "name": "createConfig",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "CreateConfigParams"
          }
        }
      ]
    },
    {
      "name": "updateConfig",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Admin address"
          ]
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "UpdateConfigParams"
          }
        }
      ]
    },
    {
      "name": "createToken",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenMint",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bondingCurve",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "CHECK"
          ]
        },
        {
          "name": "associtedBondingCurve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadata",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "CHECK"
          ]
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "CreateTokenParams"
          }
        }
      ]
    },
    {
      "name": "buy",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeRecipient",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "CHECK"
          ]
        },
        {
          "name": "bondingCurve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associtedBondingCurve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associtedUserTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "BuyParams"
          }
        }
      ]
    },
    {
      "name": "sell",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeRecipient",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "CHECK"
          ]
        },
        {
          "name": "bondingCurve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associtedBondingCurve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associtedUserTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "SellParams"
          }
        }
      ]
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "CHECK"
          ]
        },
        {
          "name": "bondingCurve",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "CHECK"
          ]
        },
        {
          "name": "associtedBondingCurve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associtedAdminTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "bondingCurve",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "virtualTokenReserves",
            "type": "u64"
          },
          {
            "name": "virtualSolReserves",
            "type": "u64"
          },
          {
            "name": "realTokenReserves",
            "type": "u64"
          },
          {
            "name": "realSolReserves",
            "type": "u64"
          },
          {
            "name": "tokenTotalSupply",
            "type": "u64"
          },
          {
            "name": "complete",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "config",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initialized",
            "type": "bool"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "feeRecipient",
            "type": "publicKey"
          },
          {
            "name": "initialVirtualTokenReserves",
            "type": "u64"
          },
          {
            "name": "initialVirtualSolReserves",
            "type": "u64"
          },
          {
            "name": "initialRealTokenReserves",
            "type": "u64"
          },
          {
            "name": "tokenTotalSupply",
            "type": "u64"
          },
          {
            "name": "feeBasePoints",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "CreateConfigParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "feeRecipient",
            "type": "publicKey"
          },
          {
            "name": "initialVirtualTokenReserves",
            "type": "u64"
          },
          {
            "name": "initialVirtualSolReserves",
            "type": "u64"
          },
          {
            "name": "initialRealTokenReserves",
            "type": "u64"
          },
          {
            "name": "tokenTotalSupply",
            "type": "u64"
          },
          {
            "name": "feeBasePoints",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "UpdateConfigParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "feeRecipient",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "initialVirtualTokenReserves",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "initialVirtualSolReserves",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "initialRealTokenReserves",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "tokenTotalSupply",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "feeBasePoints",
            "type": {
              "option": "u64"
            }
          }
        ]
      }
    },
    {
      "name": "BuyParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "maxSolCost",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "CreateTokenParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "bytes"
          },
          {
            "name": "symbol",
            "type": "bytes"
          },
          {
            "name": "uri",
            "type": "bytes"
          }
        ]
      }
    },
    {
      "name": "SellParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "minSolOutput",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "CreateTokenEvent",
      "fields": [
        {
          "name": "creator",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "tokenName",
          "type": "string",
          "index": false
        },
        {
          "name": "tokenSymbol",
          "type": "string",
          "index": false
        },
        {
          "name": "tokenUri",
          "type": "string",
          "index": false
        },
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "BuyEvent",
      "fields": [
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "buyer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "solInput",
          "type": "u64",
          "index": false
        },
        {
          "name": "tokenOutput",
          "type": "u64",
          "index": false
        },
        {
          "name": "isCompleted",
          "type": "bool",
          "index": false
        }
      ]
    },
    {
      "name": "SellEvent",
      "fields": [
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "seller",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "solOutput",
          "type": "u64",
          "index": false
        },
        {
          "name": "tokenInput",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "WithdrawEvent",
      "fields": [
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "withdrawer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "solOutput",
          "type": "u64",
          "index": false
        },
        {
          "name": "tokenOutput",
          "type": "u64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NotInitialized",
      "msg": "Account Not Initialized"
    },
    {
      "code": 6001,
      "name": "AlreadyInitialized",
      "msg": "Account Already Initialized"
    },
    {
      "code": 6002,
      "name": "InvalidParam",
      "msg": "Invalid Parameters"
    },
    {
      "code": 6003,
      "name": "SlippageExceed",
      "msg": "Slippage Exceed"
    },
    {
      "code": 6004,
      "name": "SoldAllToken",
      "msg": "Sold All Tokens"
    },
    {
      "code": 6005,
      "name": "NotEnoughToken",
      "msg": "Not Enough Tokens"
    }
  ]
};

export const IDL: Pixel = {
  "version": "0.1.0",
  "name": "pixel",
  "instructions": [
    {
      "name": "createConfig",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "CreateConfigParams"
          }
        }
      ]
    },
    {
      "name": "updateConfig",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Admin address"
          ]
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "UpdateConfigParams"
          }
        }
      ]
    },
    {
      "name": "createToken",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenMint",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bondingCurve",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "CHECK"
          ]
        },
        {
          "name": "associtedBondingCurve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadata",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "CHECK"
          ]
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "CreateTokenParams"
          }
        }
      ]
    },
    {
      "name": "buy",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeRecipient",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "CHECK"
          ]
        },
        {
          "name": "bondingCurve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associtedBondingCurve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associtedUserTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "BuyParams"
          }
        }
      ]
    },
    {
      "name": "sell",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeRecipient",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "CHECK"
          ]
        },
        {
          "name": "bondingCurve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associtedBondingCurve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associtedUserTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "SellParams"
          }
        }
      ]
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "CHECK"
          ]
        },
        {
          "name": "bondingCurve",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "CHECK"
          ]
        },
        {
          "name": "associtedBondingCurve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associtedAdminTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "bondingCurve",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "virtualTokenReserves",
            "type": "u64"
          },
          {
            "name": "virtualSolReserves",
            "type": "u64"
          },
          {
            "name": "realTokenReserves",
            "type": "u64"
          },
          {
            "name": "realSolReserves",
            "type": "u64"
          },
          {
            "name": "tokenTotalSupply",
            "type": "u64"
          },
          {
            "name": "complete",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "config",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initialized",
            "type": "bool"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "feeRecipient",
            "type": "publicKey"
          },
          {
            "name": "initialVirtualTokenReserves",
            "type": "u64"
          },
          {
            "name": "initialVirtualSolReserves",
            "type": "u64"
          },
          {
            "name": "initialRealTokenReserves",
            "type": "u64"
          },
          {
            "name": "tokenTotalSupply",
            "type": "u64"
          },
          {
            "name": "feeBasePoints",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "CreateConfigParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "feeRecipient",
            "type": "publicKey"
          },
          {
            "name": "initialVirtualTokenReserves",
            "type": "u64"
          },
          {
            "name": "initialVirtualSolReserves",
            "type": "u64"
          },
          {
            "name": "initialRealTokenReserves",
            "type": "u64"
          },
          {
            "name": "tokenTotalSupply",
            "type": "u64"
          },
          {
            "name": "feeBasePoints",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "UpdateConfigParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "feeRecipient",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "initialVirtualTokenReserves",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "initialVirtualSolReserves",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "initialRealTokenReserves",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "tokenTotalSupply",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "feeBasePoints",
            "type": {
              "option": "u64"
            }
          }
        ]
      }
    },
    {
      "name": "BuyParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "maxSolCost",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "CreateTokenParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "bytes"
          },
          {
            "name": "symbol",
            "type": "bytes"
          },
          {
            "name": "uri",
            "type": "bytes"
          }
        ]
      }
    },
    {
      "name": "SellParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "minSolOutput",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "CreateTokenEvent",
      "fields": [
        {
          "name": "creator",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "tokenName",
          "type": "string",
          "index": false
        },
        {
          "name": "tokenSymbol",
          "type": "string",
          "index": false
        },
        {
          "name": "tokenUri",
          "type": "string",
          "index": false
        },
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "BuyEvent",
      "fields": [
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "buyer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "solInput",
          "type": "u64",
          "index": false
        },
        {
          "name": "tokenOutput",
          "type": "u64",
          "index": false
        },
        {
          "name": "isCompleted",
          "type": "bool",
          "index": false
        }
      ]
    },
    {
      "name": "SellEvent",
      "fields": [
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "seller",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "solOutput",
          "type": "u64",
          "index": false
        },
        {
          "name": "tokenInput",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "WithdrawEvent",
      "fields": [
        {
          "name": "mint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "withdrawer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "solOutput",
          "type": "u64",
          "index": false
        },
        {
          "name": "tokenOutput",
          "type": "u64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NotInitialized",
      "msg": "Account Not Initialized"
    },
    {
      "code": 6001,
      "name": "AlreadyInitialized",
      "msg": "Account Already Initialized"
    },
    {
      "code": 6002,
      "name": "InvalidParam",
      "msg": "Invalid Parameters"
    },
    {
      "code": 6003,
      "name": "SlippageExceed",
      "msg": "Slippage Exceed"
    },
    {
      "code": 6004,
      "name": "SoldAllToken",
      "msg": "Sold All Tokens"
    },
    {
      "code": 6005,
      "name": "NotEnoughToken",
      "msg": "Not Enough Tokens"
    }
  ]
};
