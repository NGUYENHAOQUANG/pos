# Verification: Temporary Material Addition

I have implemented the ability to add materials temporarily using local state.

## Changes
- **MeterialScreen.tsx**: Added `materials` state and [handleSaveMaterial](file:///d:/MEBIONE/mebione-mobile-app/src/features/material/screens/MeterialScreen.tsx#59-63) function. Renders [MaterialList](file:///d:/MEBIONE/mebione-mobile-app/src/features/material/components/material/MaterialList.tsx#42-137) when materials exist.
- **AddMaterialScreen.tsx**: Updated `onSave` to pass collected data back to the parent screen.

## Verification Steps

### Manual Verification
1.  **Open the App**: Navigate to the Material screen.
2.  **Check Empty State**: Ensure you see the "Chưa có vật tư" empty state initially.
3.  **Add Material**:
    - Tap "Thêm vật tư".
    - Fill in "Tên vật tư" (e.g., Paracetamol).
    - Fill in "Nhóm vật tư" (e.g., Thuốc).
    - Fill in "Đơn vị tính" (e.g., Viên).
    - Tap "Lưu thông tin".
4.  **Verify List**:
    - Ensure you are returned to the Material list.
    - Verify that the new material is displayed in the list.
5.  **Add Another**:
    - Tap the "+" button (or "Thêm vật tư" if available).
    - Add another material.
    - Verify both materials are listed.
6.  **Refresh**:
    - Reload the app (or press `R` in terminal).
    - Verify that the list is reset to empty (as expected for temporary state).
