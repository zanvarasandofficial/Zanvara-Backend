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
exports.UpdateProductDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const product_delivery_option_dto_1 = require("./product-delivery-option.dto");
class UpdateProductDto {
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
exports.UpdateProductDto = UpdateProductDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], UpdateProductDto.prototype, "detailsHtml", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], UpdateProductDto.prototype, "specsHtml", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], UpdateProductDto.prototype, "whatsIncludedHtml", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], UpdateProductDto.prototype, "shippingReturnsHtml", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], UpdateProductDto.prototype, "originalPrice", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((_, value) => value !== null && value !== undefined),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Object)
], UpdateProductDto.prototype, "priceAfterDiscount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((_, value) => value !== null && value !== undefined),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Object)
], UpdateProductDto.prototype, "originalPriceUsd", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((_, value) => value !== null && value !== undefined),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Object)
], UpdateProductDto.prototype, "priceAfterDiscountUsd", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], UpdateProductDto.prototype, "badge", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "imageUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' ? undefined : value)),
    (0, class_validator_1.ValidateIf)((_, value) => value !== null && value !== undefined),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", Object)
], UpdateProductDto.prototype, "hoverImageUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], UpdateProductDto.prototype, "imagePublicId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], UpdateProductDto.prototype, "hoverImagePublicId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUrl)({}, { each: true }),
    __metadata("design:type", Array)
], UpdateProductDto.prototype, "galleryImageUrls", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateProductDto.prototype, "galleryImagePublicIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateProductDto.prototype, "stock", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['PUBLISHED', 'DRAFT']),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateProductDto.prototype, "isPopular", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => product_delivery_option_dto_1.ProductDeliveryOptionDto),
    __metadata("design:type", Array)
], UpdateProductDto.prototype, "deliveryOptions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['FREE', 'CHARGED']),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "deliveryType", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((dto) => !dto.deliveryOptions?.length && dto.deliveryType === 'CHARGED'),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Object)
], UpdateProductDto.prototype, "deliveryCharge", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateProductDto.prototype, "isComingSoon", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((dto) => dto.isComingSoon === true),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "availableAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateProductDto.prototype, "isPreOrder", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((dto) => dto.isPreOrder === true),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateProductDto.prototype, "preOrderCapacity", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((dto) => dto.isPreOrder === true),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "expectedShipAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], UpdateProductDto.prototype, "expectedShipNote", void 0);
//# sourceMappingURL=update-product.dto.js.map