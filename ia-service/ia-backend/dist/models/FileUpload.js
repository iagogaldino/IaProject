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
exports.FileUpload = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const FileUploadSchema = new mongoose_1.Schema({
    agentId: {
        type: String,
        required: true,
        index: true
    },
    originalName: {
        type: String,
        required: true,
        trim: true
    },
    fileName: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    filePath: {
        type: String,
        required: true,
        trim: true
    },
    fileSize: {
        type: Number,
        required: true,
        min: 0
    },
    mimeType: {
        type: String,
        required: true,
        trim: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    processedAt: {
        type: Date
    },
    content: {
        type: String
    },
    screenshotPaths: [{
            type: String
        }],
    metadata: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {}
    },
    enrichedMetadata: {
        theme: {
            type: String
        },
        improvedContent: {
            type: String
        },
        tags: [{
                type: String
            }],
        analysis: {
            summary: {
                type: String
            },
            keyTopics: [{
                    type: String
                }],
            sentiment: {
                type: String
            },
            confidence: {
                type: Number,
                min: 0,
                max: 1
            },
            language: {
                type: String
            }
        },
        aiAnalysis: {
            processedAt: {
                type: Date,
                default: Date.now
            },
            agentId: {
                type: String
            },
            version: {
                type: String,
                default: '1.0'
            }
        }
    }
}, {
    timestamps: true,
    versionKey: false
});
FileUploadSchema.index({ agentId: 1, uploadedAt: -1 });
FileUploadSchema.index({ fileName: 1 });
FileUploadSchema.index({ mimeType: 1 });
FileUploadSchema.index({ uploadedAt: -1 });
FileUploadSchema.pre('save', function (next) {
    if (!this.id) {
        this.id = this._id.toString();
    }
    next();
});
exports.FileUpload = mongoose_1.default.model('FileUpload', FileUploadSchema);
//# sourceMappingURL=FileUpload.js.map