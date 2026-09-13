"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProductDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const product_delivery_option_dto_1 = require("./product-delivery-option.dto");
class CreateProductDto {
    name;
    description;
    detailsHtml;
    specsHtml;
    whatsIncludedHtml;
    shippingReturnsHtml;
    category;
    originalPrice;
    priceAfterDiscount;
    originalPriceUsd;
    priceAfterDiscountUsd;
    badge;
    imageUrl;
    hoverImageUrl;
    imagePublicId;
    hoverImagePublicId;
    galleryImageUrls;
    galleryImagePublicIds;
    stock;
    status;
    isPopular;
    deliveryOptions;
    deliveryType;
    deliveryCharge;
    isComingSoon;
    availableAt;
    isPreOrder;
    preOrderCapacity;
    expectedShipAt;
    expectedShipNote;
}
exports.CreateProductDto = CreateProductDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], CreateProductDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], CreateProductDto.prototype, "detailsHtml", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], CreateProductDto.prototype, "specsHtml", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], CreateProductDto.prototype, "whatsIncludedHtml", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], CreateProductDto.prototype, "shippingReturnsHtml", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], CreateProductDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "originalPrice", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((_, value) => value !== null && value !== undefined),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Object)
], CreateProductDto.prototype, "priceAfterDiscount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Object)
], CreateProductDto.prototype, "originalPriceUsd", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((_, value) => value !== null && value !== undefined),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Object)
], CreateProductDto.prototype, "priceAfterDiscountUsd", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "badge", void 0);
__decorate([
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "imageUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "hoverImageUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "imagePublicId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "hoverImagePublicId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUrl)({}, { each: true }),
    __metadata("design:type", Array)
], CreateProductDto.prototype, "galleryImageUrls", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateProductDto.prototype, "galleryImagePublicIds", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "stock", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['PUBLISHED', 'DRAFT']),
    __metadata("design:type", String)
], CreateProductDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateProductDto.prototype, "isPopular", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => product_delivery_option_dto_1.ProductDeliveryOptionDto),
    __metadata("design:type", Array)
], CreateProductDto.prototype, "deliveryOptions", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((dto) => !dto.deliveryOptions?.length),
    (0, class_validator_1.IsIn)(['FREE', 'CHARGED']),
    __metadata("design:type", String)
], CreateProductDto.prototype, "deliveryType", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((dto) => !dto.deliveryOptions?.length && dto.deliveryType === 'CHARGED'),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Object)
], CreateProductDto.prototype, "deliveryCharge", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateProductDto.prototype, "isComingSoon", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((dto) => dto.isComingSoon === true),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "availableAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateProductDto.prototype, "isPreOrder", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((dto) => dto.isPreOrder === true),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "preOrderCapacity", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((dto) => dto.isPreOrder === true),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "expectedShipAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], CreateProductDto.prototype, "expectedShipNote", void 0);
//# sourceMappingURL=create-product.dto.js.map