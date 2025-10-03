"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agent = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AgentSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 255
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive'
    },
    canCommunicateWith: {
        type: [String],
        default: []
    },
    databaseAccess: {
        enabled: {
            type: Boolean,
            default: false
        },
        allowedCollections: {
            type: [String],
            default: []
        },
        allowedOperations: {
            type: [String],
            enum: ['read', 'write', 'update', 'delete'],
            default: ['read']
        },
        queryLimits: {
            maxResults: {
                type: Number,
                default: 100
            },
            timeout: {
                type: Number,
                default: 30000
            }
        }
    },
    fileAccess: {
        enabled: {
            type: Boolean,
            default: false
        },
        allowedFileTypes: {
            type: [String],
            default: ['txt', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv']
        },
        maxFileSize: {
            type: Number,
            default: 10485760
        },
        allowedOperations: {
            type: [String],
            enum: ['read', 'upload', 'delete'],
            default: ['read']
        },
        storagePath: {
            type: String,
            default: 'uploads'
        }
    }
}, {
    timestamps: true,
    versionKey: false
});
AgentSchema.index({ name: 1 }, { unique: true });
AgentSchema.index({ status: 1 });
AgentSchema.index({ createdAt: -1 });
AgentSchema.pre('save', function (next) {
    if (this.canCommunicateWith) {
        this.canCommunicateWith = this.canCommunicateWith
            .map((id) => id.trim())
            .filter((id) => id.length > 0);
    }
    next();
});
exports.Agent = mongoose_1.default.model('Agent', AgentSchema);
//# sourceMappingURL=Agent.js.map