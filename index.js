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
    },
    shortcuts: {
        asterisk: "",
        quotes: "",
        parentheses: "",
        bookQuotes1: "",
        bookQuotes2: "",
        bookQuotes3: "",
        newline: "",
        user: "",
        char: ""
    },
    // 添加默认的按钮顺序
    buttonOrder: [
        'asterisk',
        'quotes',
        'parentheses',
        'bookQuotes1',
        'bookQuotes2',
        'bookQuotes3',
        'newline',
        'user',
        'char'
    ]
};

// 快捷键映射表
const shortcutFunctionMap = {
    'asterisk': insertAsterisk,
    'quotes': insertQuotes,
    'parentheses': insertParentheses,
    'bookQuotes1': insertBookQuotes1,
    'bookQuotes2': insertBookQuotes2,
    'bookQuotes3': insertBookQuotes3,
    'newline': insertNewLine,
    'user': insertUserTag,
    'char': insertCharTag
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

    // 兼容旧版本设置 - 快捷键
    if (!extension_settings[extensionName].shortcuts) {
        extension_settings[extensionName].shortcuts = defaultSettings.shortcuts;
    }
    
    // 兼容旧版本设置 - 按钮顺序
    if (!extension_settings[extensionName].buttonOrder) {
        extension_settings[extensionName].buttonOrder = defaultSettings.buttonOrder;
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
    
    // 更新快捷键设置
    const shortcuts = extension_settings[extensionName].shortcuts;
    for (const key in shortcuts) {
        $(`#shortcut_${key}`).val(shortcuts[key] || "");
    }
    
    // 更新按钮顺序
    updateButtonsOrder();
    
    updateButtonVisibility();
}

// 更新设置面板中的按钮顺序
function updateButtonsOrder() {
    const buttonOrder = extension_settings[extensionName].buttonOrder;
    if (!buttonOrder || buttonOrder.length === 0) return;
    
    // 根据保存的顺序重新排列设置面板中的按钮
    const container = $("#integrated_button_settings");
    
    buttonOrder.forEach(key => {
        const buttonRow = $(`.integrated-button-row[data-button-key="${key}"]`);
        if (buttonRow.length) {
            container.append(buttonRow);
        }
    });
}

// 初始化按钮排序
function initSortable() {
    try {
        if ($("#integrated_button_settings").sortable) {
            $("#integrated_button_settings").sortable({
                handle: ".drag-handle",
                axis: "y",
                delay: 150,
                stop: function() {
                    // 获取新的排序
                    const newOrder = [];
                    $("#integrated_button_settings .integrated-button-row").each(function() {
                        const buttonKey = $(this).attr("data-button-key");
                        newOrder.push(buttonKey);
                    });
                    
                    // 保存新排序到设置
                    extension_settings[extensionName].buttonOrder = newOrder;
                    saveSettingsDebounced();
                    
                    // 更新工具栏按钮顺序
                    updateToolbarButtonOrder();
                }
            });
        } else {
            console.warn("jQuery UI Sortable 不可用，无法启用拖拽排序功能");
        }
    } catch (error) {
        console.error("初始化按钮排序功能失败:", error);
    }
}

// 更新工具栏按钮顺序
function updateToolbarButtonOrder() {
    const buttonOrder = extension_settings[extensionName].buttonOrder || [];
    if (buttonOrder.length === 0) return;
    
    const toolbar = $("#input_helper_toolbar");
    if (toolbar.length === 0) return;
    
    // 按照保存的顺序重新排列工具栏按钮
    buttonOrder.forEach(key => {
        const buttonId = getButtonIdFromKey(key);
        const button = $(`#${buttonId}`);
        if (button.length && extension_settings[extensionName].buttons[key] !== false) {
            toolbar.append(button);
        }
    });
}

// 从按钮键名获取按钮ID
function getButtonIdFromKey(key) {
    const keyToId = {
        'asterisk': 'input_asterisk_btn',
        'quotes': 'input_quotes_btn',
        'parentheses': 'input_parentheses_btn',
        'bookQuotes1': 'input_book_quotes1_btn',
        'bookQuotes2': 'input_book_quotes2_btn',
        'bookQuotes3': 'input_book_quotes3_btn',
        'newline': 'input_newline_btn',
        'user': 'input_user_btn',
        'char': 'input_char_btn'
    };
    
    return keyToId[key] || '';
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
        
        // 更新按钮顺序
        updateToolbarButtonOrder();
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

// 处理快捷键设置
function setupShortcutInputs() {
    // 处理快捷键输入
    $(".shortcut-input").on("keydown", function(e) {
        e.preventDefault();
        
        // 获取按键组合
        let keys = [];
        if (e.ctrlKey) keys.push("Ctrl");
        if (e.altKey) keys.push("Alt");
        if (e.shiftKey) keys.push("Shift");
        
        // 添加主键（如果不是修饰键）
        if (
            e.key !== "Control" && 
            e.key !== "Alt" && 
            e.key !== "Shift" && 
            e.key !== "Meta" &&
            e.key !== "Escape"
        ) {
            // 将键名首字母大写
            const keyName = e.key.length === 1 ? e.key.toUpperCase() : e.key;
            keys.push(keyName);
        }
        
        // 如果只按了Escape键，清除快捷键
        if (e.key === "Escape") {
            $(this).val("");
            const shortcutKey = $(this).attr("id").replace("shortcut_", "");
            extension_settings[extensionName].shortcuts[shortcutKey] = "";
            saveSettingsDebounced();
            return;
        }
        
        // 如果没有按键组合或只有修饰键，不设置
        if (keys.length === 0 || (keys.length === 1 && ["Ctrl", "Alt", "Shift"].includes(keys[0]))) {
            return;
        }
        
        // 设置快捷键
        const shortcutString = keys.join("+");
        $(this).val(shortcutString);
        
        // 保存到设置
        const shortcutKey = $(this).attr("id").replace("shortcut_", "");
        extension_settings[extensionName].shortcuts[shortcutKey] = shortcutString;
        saveSettingsDebounced();
    });
    
    // 处理清除按钮
    $(".shortcut-clear-btn").on("click", function() {
        const targetId = $(this).data("target");
        $(`#${targetId}`).val("");
        
        // 保存到设置
        const shortcutKey = targetId.replace("shortcut_", "");
        extension_settings[extensionName].shortcuts[shortcutKey] = "";
        saveSettingsDebounced();
    });
}

// 全局快捷键处理函数
function handleGlobalShortcuts(e) {
    // 如果插件未启用或正在编辑快捷键，不处理
    if (!extension_settings[extensionName].enabled || $(document.activeElement).hasClass("shortcut-input")) {
        return;
    }
    
    // 如果当前焦点不在文本区域，不处理
    const messageInput = getMessageInput()[0];
    if (document.activeElement !== messageInput) {
        return;
    }
    
    // 获取当前按键组合
    let keys = [];
    if (e.ctrlKey) keys.push("Ctrl");
    if (e.altKey) keys.push("Alt");
    if (e.shiftKey) keys.push("Shift");
    
    // 添加主键（如果不是修饰键）
    if (
        e.key !== "Control" && 
        e.key !== "Alt" && 
        e.key !== "Shift" && 
        e.key !== "Meta"
    ) {
        // 将键名首字母大写
        const keyName = e.key.length === 1 ? e.key.toUpperCase() : e.key;
        keys.push(keyName);
    }
    
    // 如果没有有效的按键组合，不处理
    if (keys.length <= 1) {
        return;
    }
    
    const shortcutString = keys.join("+");
    const shortcuts = extension_settings[extensionName].shortcuts;
    
    // 查找匹配的快捷键
    for (const key in shortcuts) {
        if (shortcuts[key] === shortcutString) {
            e.preventDefault();
            // 执行对应的功能
            if (shortcutFunctionMap[key]) {
                shortcutFunctionMap[key]();
                return;
            }
        }
    }
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
    
    // 设置快捷键输入框
    setupShortcutInputs();
    
    // 初始化排序功能
    initSortable();
    
    // 注册全局快捷键事件
    $(document).on("keydown", handleGlobalShortcuts);
    
    // 根据初始化设置显示或隐藏工具栏
    if (!extension_settings[extensionName].enabled) {
        $("#input_helper_toolbar").hide();
    }
    
    console.log("输入助手插件已加载");
});
