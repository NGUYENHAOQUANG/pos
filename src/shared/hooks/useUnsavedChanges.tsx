import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ConfirmationModal } from '@/shared/components/modal/ConfirmationModal';

/**
 * Hook to handle unsaved changes warning before navigating away.
 * Returns the ConfirmationModal component to be rendered in the screen.
 *
 * @param hasUnsavedChanges boolean indicating if there are modifying changes
 * @param onDiscard optional callback if user decides to discard changes and leave
 *
 * @example
 * const { UnsavedChangesModal } = useUnsavedChanges(hasChanges);
 *
 * return (
 *   <View>
 *     ...
 *     {UnsavedChangesModal}
 *   </View>
 * );
 */
export const useUnsavedChanges = (hasUnsavedChanges: boolean, onDiscard?: () => void) => {
    const navigation = useNavigation();
    const [showModal, setShowModal] = useState(false);
    const [pendingAction, setPendingAction] = useState<any>(null);
    const isBypassedRef = React.useRef(false);

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', e => {
            if (!hasUnsavedChanges || isBypassedRef.current) {
                // If we don't have unsaved changes or we explicitly bypassed, do nothing
                return;
            }

            // Prevent default behavior of leaving the screen
            e.preventDefault();

            // Store the action to be able to dispatch it later
            setPendingAction(e.data.action);
            setShowModal(true);
        });

        return unsubscribe;
    }, [navigation, hasUnsavedChanges]);

    const handleConfirmLeave = () => {
        setShowModal(false);
        if (onDiscard) {
            onDiscard();
        }
        if (pendingAction) {
            navigation.dispatch(pendingAction);
        }
    };

    const handleCancelLeave = () => {
        setShowModal(false);
        setPendingAction(null);
    };

    const UnsavedChangesModal = (
        <ConfirmationModal
            visible={showModal}
            type="unsaved_changes"
            onConfirm={handleConfirmLeave}
            onCancel={handleCancelLeave}
        />
    );

    return {
        UnsavedChangesModal,
        allowNavigation: () => {
            isBypassedRef.current = true;
        },
        // Expose function to trigger programmatically if needed (e.g. custom back button)
        triggerLeaveWarning: (action: any) => {
            if (hasUnsavedChanges && !isBypassedRef.current) {
                setPendingAction(action);
                setShowModal(true);
                return false;
            }
            return true;
        },
    };
};
