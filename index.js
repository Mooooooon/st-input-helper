// The main script for the extension
// The following are examples of some basic extension functionality

//You'll likely need to import extension_settings, getContext, and loadExtensionSettings from extensions.js
import { extension_settings, getContext, loadExtensionSettings } from "../../../extensions.js";

//You'll likely need to import some other functions from the main script
import { saveSettingsDebounced } from "../../../../script.js";

// 设置插件名称和路径
const extensionName = "st-input-helper";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
const defaultSettings = {
    enabled: true,
    buttons: {
        asterisk: true,
        quotes: true,
        parentheses: true,
        bookQuotes1: true,
        bookQuotes2: true,
        bookQuotes3: true, // 新增《》按钮设置
        newline: true,
        user: true,
        char: true
    }
};

// 加载插件设置
async function loadSettings() {
    extension_settings[extensionName] = extension_settings[extensionName] || {};
    if (Object.keys(extension_settings[extensionName]).length === 0) {
        Object.assign(extension_settings[extensionName], defaultSettings);
    }
    
    // 兼容旧版本设置
    if (!extension_settings[extensionName].buttons) {
        extension_settings[extensionName].buttons = defaultSettings.buttons;
    }

    // 更新UI中的设置
    $("#enable_input_helper").prop("checked", extension_settings[extensionName].enabled);
    
    // 更新按钮显示设置
    const buttons = extension_settings[extensionName].buttons;
    $("#enable_asterisk_btn").prop("checked", buttons.asterisk !== false);
    $("#enable_quotes_btn").prop("checked", buttons.quotes !== false);
    $("#enable_parentheses_btn").prop("checked", buttons.parentheses !== false);
    $("#enable_book_quotes1_btn").prop("checked", buttons.bookQuotes1 !== false);
    $("#enable_book_quotes2_btn").prop("checked", buttons.bookQuotes2 !== false);
    $("#enable_book_quotes3_btn").prop("checked", buttons.bookQuotes3 !== false); // 新增书名号按钮设置
    $("#enable_newline_btn").prop("checked", buttons.newline !== false);
    $("#enable_user_btn").prop("checked", buttons.user !== false);
    $("#enable_char_btn").prop("checked", buttons.char !== false);
    
    updateButtonVisibility();
}

// 更新按钮可见性
function updateButtonVisibility() {
    const buttons = extension_settings[extensionName].buttons;
    
    // 根据设置显示/隐藏按钮
    $("#input_asterisk_btn").toggle(buttons.asterisk !== false);
    $("#input_quotes_btn").toggle(buttons.quotes !== false);
    $("#input_parentheses_btn").toggle(buttons.parentheses !== false);
    $("#input_book_quotes1_btn").toggle(buttons.bookQuotes1 !== false);
    $("#input_book_quotes2_btn").toggle(buttons.bookQuotes2 !== false);
    $("#input_book_quotes3_btn").toggle(buttons.bookQuotes3 !== false); // 新增书名号按钮
    $("#input_newline_btn").toggle(buttons.newline !== false);
    $("#input_user_btn").toggle(buttons.user !== false);
    $("#input_char_btn").toggle(buttons.char !== false);
    
    // 检查所有按钮是否都被隐藏，如果是则隐藏整个工具栏
    const allHidden = Object.values(buttons).every(v => v === false);
    if (allHidden) {
        $("#input_helper_toolbar").hide();
    } else if (extension_settings[extensionName].enabled) {
        $("#input_helper_toolbar").show();
    }
}

// 开关设置变更响应
function onEnableInputChange() {
    const value = $("#enable_input_helper").prop("checked");
    extension_settings[extensionName].enabled = value;
    saveSettingsDebounced();
    
    // 根据复选框状态显示或隐藏工具栏
    if (value) {
        updateButtonVisibility();
    } else {
        $("#input_helper_toolbar").hide();
    }
}

// 按钮显示设置变更响应
function onButtonVisibilityChange(buttonKey) {
    return function() {
        const checked = $(this).prop("checked");
        extension_settings[extensionName].buttons[buttonKey] = checked;
        saveSettingsDebounced();
        updateButtonVisibility();
    };
}

// 获取输入框元素
function getMessageInput() {
    return $("#send_textarea, #prompt_textarea").first();
}

// 插入引号功能
function insertQuotes() {
    if (!extension_settings[extensionName].enabled) return;
    
    const textarea = getMessageInput();
    const startPos = textarea.prop("selectionStart");
    const endPos = textarea.prop("selectionEnd");
    const text = textarea.val();
    
    const beforeText = text.substring(0, startPos);
    const selectedText = text.substring(startPos, endPos);
    const afterText = text.substring(endPos);
    
    // 插入双引号并将光标放在中间
    const newText = beforeText + "\"\"" + afterText;
    textarea.val(newText);
    
    // 设置光标位置在双引号中间
    setTimeout(() => {
        textarea.prop("selectionStart", startPos + 1);
        textarea.prop("selectionEnd", startPos + 1);
        textarea.focus();
    }, 0);
}

// 插入换行功能
function insertNewLine() {
    if (!extension_settings[extensionName].enabled) return;
    
    const textarea = getMessageInput();
    const text = textarea.val();
    const cursorPos = textarea.prop("selectionStart");
    
    // 查找当前行的末尾位置
    let lineEnd = text.indexOf("\n", cursorPos);
    if (lineEnd === -1) {
        // 如果没有找到换行符，说明光标在最后一行，使用文本长度作为行末
        lineEnd = text.length;
    }
    
    // 在行末插入换行符
    const newText = text.substring(0, lineEnd) + "\n" + text.substring(lineEnd);
    textarea.val(newText);
    
    // 设置光标位置在新插入的换行符之后
    setTimeout(() => {
        textarea.prop("selectionStart", lineEnd + 1);
        textarea.prop("selectionEnd", lineEnd + 1);
        textarea.focus();
    }, 0);
}

// 插入星号功能
function insertAsterisk() {
    if (!extension_settings[extensionName].enabled) return;
    
    const textarea = getMessageInput();
    const startPos = textarea.prop("selectionStart");
    const endPos = textarea.prop("selectionEnd");
    const text = textarea.val();
    
    const beforeText = text.substring(0, startPos);
    const selectedText = text.substring(startPos, endPos);
    const afterText = text.substring(endPos);
    
    // 插入两个星号并将光标放在中间
    const newText = beforeText + "**" + afterText;
    textarea.val(newText);
    
    // 设置光标位置在星号中间
    setTimeout(() => {
        textarea.prop("selectionStart", startPos + 1);
        textarea.prop("selectionEnd", startPos + 1);
        textarea.focus();
    }, 0);
}

// 插入用户标记功能
function insertUserTag() {
    if (!extension_settings[extensionName].enabled) return;
    
    const textarea = getMessageInput();
    const startPos = textarea.prop("selectionStart");
    const endPos = textarea.prop("selectionEnd");
    const text = textarea.val();
    
    const beforeText = text.substring(0, startPos);
    const selectedText = text.substring(startPos, endPos);
    const afterText = text.substring(endPos);
    
    // 插入用户标记
    const newText = beforeText + "{{User}}" + afterText;
    textarea.val(newText);
    
    // 设置光标位置在标记之后
    setTimeout(() => {
        textarea.prop("selectionStart", startPos + 8); // "{{User}}".length = 8
        textarea.prop("selectionEnd", startPos + 8);
        textarea.focus();
    }, 0);
}

// 插入角色标记功能
function insertCharTag() {
    if (!extension_settings[extensionName].enabled) return;
    
    const textarea = getMessageInput();
    const startPos = textarea.prop("selectionStart");
    const endPos = textarea.prop("selectionEnd");
    const text = textarea.val();
    
    const beforeText = text.substring(0, startPos);
    const selectedText = text.substring(startPos, endPos);
    const afterText = text.substring(endPos);
    
    // 插入角色标记
    const newText = beforeText + "{{Char}}" + afterText;
    textarea.val(newText);
    
    // 设置光标位置在标记之后
    setTimeout(() => {
        textarea.prop("selectionStart", startPos + 8); // "{{Char}}".length = 8
        textarea.prop("selectionEnd", startPos + 8);
        textarea.focus();
    }, 0);
}

// 插入圆括号功能
function insertParentheses() {
    if (!extension_settings[extensionName].enabled) return;
    
    const textarea = getMessageInput();
    const startPos = textarea.prop("selectionStart");
    const endPos = textarea.prop("selectionEnd");
    const text = textarea.val();
    
    const beforeText = text.substring(0, startPos);
    const selectedText = text.substring(startPos, endPos);
    const afterText = text.substring(endPos);
    
    // 插入圆括号并将光标放在中间
    const newText = beforeText + "()" + afterText;
    textarea.val(newText);
    
    // 设置光标位置在括号中间
    setTimeout(() => {
        textarea.prop("selectionStart", startPos + 1);
        textarea.prop("selectionEnd", startPos + 1);
        textarea.focus();
    }, 0);
}

// 插入书名号「」功能
function insertBookQuotes1() {
    if (!extension_settings[extensionName].enabled) return;
    
    const textarea = getMessageInput();
    const startPos = textarea.prop("selectionStart");
    const endPos = textarea.prop("selectionEnd");
    const text = textarea.val();
    
    const beforeText = text.substring(0, startPos);
    const selectedText = text.substring(startPos, endPos);
    const afterText = text.substring(endPos);
    
    // 插入书名号并将光标放在中间
    const newText = beforeText + "「」" + afterText;
    textarea.val(newText);
    
    // 设置光标位置在书名号中间
    setTimeout(() => {
        textarea.prop("selectionStart", startPos + 1);
        textarea.prop("selectionEnd", startPos + 1);
        textarea.focus();
    }, 0);
}

// 插入书名号『』功能
function insertBookQuotes2() {
    if (!extension_settings[extensionName].enabled) return;
    
    const textarea = getMessageInput();
    const startPos = textarea.prop("selectionStart");
    const endPos = textarea.prop("selectionEnd");
    const text = textarea.val();
    
    const beforeText = text.substring(0, startPos);
    const selectedText = text.substring(startPos, endPos);
    const afterText = text.substring(endPos);
    
    // 插入书名号并将光标放在中间
    const newText = beforeText + "『』" + afterText;
    textarea.val(newText);
    
    // 设置光标位置在书名号中间
    setTimeout(() => {
        textarea.prop("selectionStart", startPos + 1);
        textarea.prop("selectionEnd", startPos + 1);
        textarea.focus();
    }, 0);
}

// 插入书名号《》功能
function insertBookQuotes3() {
    if (!extension_settings[extensionName].enabled) return;
    
    const textarea = getMessageInput();
    const startPos = textarea.prop("selectionStart");
    const endPos = textarea.prop("selectionEnd");
    const text = textarea.val();
    
    const beforeText = text.substring(0, startPos);
    const selectedText = text.substring(startPos, endPos);
    const afterText = text.substring(endPos);
    
    // 插入书名号并将光标放在中间
    const newText = beforeText + "《》" + afterText;
    textarea.val(newText);
    
    // 设置光标位置在书名号中间
    setTimeout(() => {
        textarea.prop("selectionStart", startPos + 1);
        textarea.prop("selectionEnd", startPos + 1);
        textarea.focus();
    }, 0);
}

// 初始化插件
jQuery(async () => {
    // 加载HTML - 修改文件名从example.html到settings.html
    const settingsHtml = await $.get(`${extensionFolderPath}/settings.html`);
    $("#extensions_settings2").append(settingsHtml);
    
    // 加载输入工具栏HTML
    const toolbarHtml = await $.get(`${extensionFolderPath}/toolbar.html`);
    
    // 将工具栏插入到 #qr--bar 下方，并确保正确的视觉顺序
    if ($("#qr--bar").length) {
        // 如果存在QR Bar，确保正确的插入位置和样式
        $("#qr--bar").after(toolbarHtml);
        
        // 为了确保正确的视觉顺序，应用特定的CSS
        $("#send_form").css("display", "flex");
        $("#send_form").css("flex-direction", "column");
        $("#qr--bar").css("order", "1");
        $("#input_helper_toolbar").css("order", "2");
    } else {
        // 如果不存在QR Bar，则插入到file_form后
        $("#file_form").after(toolbarHtml);
    }
    
    // 注册事件监听
    $("#insert_quotes_button").on("click", insertQuotes);
    $("#new_line_button").on("click", insertNewLine);
    $("#insert_asterisk_button").on("click", insertAsterisk);
    $("#enable_input_helper").on("input", onEnableInputChange);
    
    // 工具栏按钮监听
    $("#input_asterisk_btn").on("click", insertAsterisk);
    $("#input_quotes_btn").on("click", insertQuotes);
    $("#input_newline_btn").on("click", insertNewLine);
    $("#input_user_btn").on("click", insertUserTag);
    $("#input_char_btn").on("click", insertCharTag);
    $("#input_parentheses_btn").on("click", insertParentheses);
    $("#input_book_quotes1_btn").on("click", insertBookQuotes1);
    $("#input_book_quotes2_btn").on("click", insertBookQuotes2);
    $("#input_book_quotes3_btn").on("click", insertBookQuotes3); // 新增按钮监听
    
    // 注册设置变更事件监听
    $("#enable_input_helper").on("input", onEnableInputChange);
    $("#enable_asterisk_btn").on("input", onButtonVisibilityChange("asterisk"));
    $("#enable_quotes_btn").on("input", onButtonVisibilityChange("quotes"));
    $("#enable_parentheses_btn").on("input", onButtonVisibilityChange("parentheses"));
    $("#enable_book_quotes1_btn").on("input", onButtonVisibilityChange("bookQuotes1"));
    $("#enable_book_quotes2_btn").on("input", onButtonVisibilityChange("bookQuotes2"));
    $("#enable_book_quotes3_btn").on("input", onButtonVisibilityChange("bookQuotes3")); // 新增按钮设置监听
    $("#enable_newline_btn").on("input", onButtonVisibilityChange("newline"));
    $("#enable_user_btn").on("input", onButtonVisibilityChange("user"));
    $("#enable_char_btn").on("input", onButtonVisibilityChange("char"));
    
    // 加载设置
    await loadSettings();
    
    // 根据初始化设置显示或隐藏工具栏
    if (!extension_settings[extensionName].enabled) {
        $("#input_helper_toolbar").hide();
    }
    
    console.log("输入助手插件已加载");
});
