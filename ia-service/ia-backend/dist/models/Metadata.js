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
exports.Metadata = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const MetadataSchema = new mongoose_1.Schema({
    fileId: {
        type: String,
        required: true,
        index: true
    },
    agentId: {
        type: String,
        required: true,
        index: true
    },
    theme: {
        type: String,
        required: true,
        trim: true
    },
    improvedContent: {
        type: String
    },
    tags: [{
            type: String,
            trim: true
        }],
    analysis: {
        summary: {
            type: String,
            required: true
        },
        keyTopics: [{
                type: String,
                trim: true
            }],
        sentiment: {
            type: String,
            required: true,
            enum: ['positivo', 'negativo', 'neutro', 'positive', 'negative', 'neutral']
        },
        confidence: {
            type: Number,
            required: true,
            min: 0,
            max: 1
        },
        language: {
            type: String,
            required: true
        }
    },
    aiAnalysis: {
        processedAt: {
            type: Date,
            default: Date.now
        },
        agentId: {
            type: String,
            required: true
        },
        version: {
            type: String,
            default: '1.0'
        }
    }
}, {
    timestamps: true,
    versionKey: false
});
MetadataSchema.index({ fileId: 1, agentId: 1 });
MetadataSchema.index({ theme: 1 });
MetadataSchema.index({ tags: 1 });
MetadataSchema.index({ 'analysis.sentiment': 1 });
MetadataSchema.index({ createdAt: -1 });
MetadataSchema.pre('save', function (next) {
    if (!this.id) {
        this.id = this._id.toString();
    }
    next();
});
exports.Metadata = mongoose_1.default.model('Metadata', MetadataSchema);
//# sourceMappingURL=Metadata.js.map