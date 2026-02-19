# Toast Notification System

A beautiful toast notification system that displays messages in the top-left corner of the screen.

## Features

- ✅ **4 Types**: success, error, warning, info
- 🎨 **Gradient Designs**: Each type has a unique gradient color
- ⏱️ **Auto-dismiss**: Configurable duration (default: 3 seconds)
- 🎭 **Smooth Animations**: Slide-in/out with Framer Motion
- 📱 **Responsive**: Works on all screen sizes
- 🔄 **Progress Bar**: Visual indicator of auto-close timing

## Usage

### 1. Import the hook

```javascript
import { useToast } from '../context/ToastContext';
```

### 2. Use in your component

```javascript
const MyComponent = () => {
  const { success, error, warning, info } = useToast();

  const handleSave = () => {
    // ... save logic
    success('تم الحفظ بنجاح!');
  };

  const handleError = () => {
    // ... error handling
    error('حدث خطأ أثناء الحفظ');
  };

  const handleWarning = () => {
    warning('تنبيه: البيانات غير مكتملة');
  };

  const handleInfo = () => {
    info('معلومة: تم التحديث بنجاح');
  };

  return (
    <div>
      <button onClick={handleSave}>حفظ</button>
      <button onClick={handleError}>خطأ</button>
      <button onClick={handleWarning}>تنبيه</button>
      <button onClick={handleInfo}>معلومة</button>
    </div>
  );
};
```

## API

### `useToast()` returns:

| Method | Parameters | Description |
|--------|-----------|-------------|
| `success(message, duration?)` | `message: string`, `duration?: number` | Show success toast |
| `error(message, duration?)` | `message: string`, `duration?: number` | Show error toast |
| `warning(message, duration?)` | `message: string`, `duration?: number` | Show warning toast |
| `info(message, duration?)` | `message: string`, `duration?: number` | Show info toast |

### Parameters:

- **`message`** (required): The text message to display
- **`duration`** (optional): Auto-close time in milliseconds (default: 3000ms)
  - Set to `0` to disable auto-close

## Examples

### Basic Usage

```javascript
success('تم الحفظ بنجاح!');
```

### Custom Duration

```javascript
success('رسالة تختفي بعد 5 ثواني', 5000);
```

### No Auto-close

```javascript
info('رسالة دائمة حتى يغلقها المستخدم', 0);
```

### Multiple Toasts

```javascript
// Show multiple toasts
success('تم الإرسال!');
info('جاري المعالجة...');
```

## Toast Types

| Type | Color | Icon | Use Case |
|------|-------|------|----------|
| `success` | Green | ✓ Check circle | Successful operations |
| `error` | Red | ! Exclamation | Errors and failures |
| `warning` | Amber | ⚠ Triangle | Warnings and cautions |
| `info` | Blue | ℹ Info circle | General information |

## Styling

Toasts appear in the **top-left corner** with:
- Fixed positioning (`top-4 left-4`)
- High z-index (`z-[100]`)
- Minimum width: 320px
- Maximum width: 448px
- Gap between multiple toasts: 8px

## Notes

- Toasts are **stacked vertically** if multiple are shown
- Each toast has a **unique ID** based on timestamp
- Clicking the **× button** closes the toast immediately
- The **progress bar** shows remaining time before auto-close
