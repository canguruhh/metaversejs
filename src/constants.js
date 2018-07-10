module.exports = Object.freeze({
    ATTACHMENT: {
        TYPE: {
            ETP_TRANSFER: 0,
            MST: 2,
            MESSAGE: 3,
            AVATAR: 4,
            CERT: 5,
            MIT: 6
        },
        VERSION: {
            DEFAULT: 1,
            DID: 207
        }
    },

    MST: {
        STATUS: {
            REGISTER: 1,
            TRANSFER: 2
        }
    },

    MIT: {
        STATUS: {
            REGISTER: 1,
            TRANSFER: 2
        }
    },

    CERT:{
        TYPE:{
            ISSUE: 1,
            DOMAIN: 2,
            NAMING: 3
        },
        STATUS:{
            DEFAULT: 0,
            ISSUE: 1,
            TRANSFER: 2,
            AUTOISSUE: 3
        }
    },

    AVATAR:{
        STATUS:{
            REGISTER: 1,
            TRANSFER: 2
        }
    },

    FEE: {
        DEFAULT: 10000,
        MST_REGISTER: 1000000000,
        AVATAR_REGISTER: 100000000
    },

    CELEBRITIES: {
        BOUNTY: {
            address: "MAwLwVGwJyFsTBfNj2j5nCUrQXGVRvHzPh",
            symbol: "developer-community"
        }
    }
});
