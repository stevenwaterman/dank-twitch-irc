"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateChannelName = void 0;
const reason_for_value_1 = require("../utils/reason-for-value");
const validation_error_1 = require("./validation-error");
const channelNameRegex = /^[a-z0-9_]{1,25}$/;
const chatRoomRegex = /^chatrooms:\d{1,20}:[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}$/;
function validateChannelName(input) {
    if (input != null) {
        if (chatRoomRegex.test(input) || channelNameRegex.test(input)) {
            return;
        }
    }
    throw new validation_error_1.ValidationError(`Channel name ${reason_for_value_1.reasonForValue(input)} is invalid/malformed`);
}
exports.validateChannelName = validateChannelName;
//# sourceMappingURL=channel.js.map