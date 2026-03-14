import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';

export default function LoginScreen({ navigation }) {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1);

    const handleLogin = () => {
        if (step === 1) {
            if (phone.length >= 10) setStep(2);
        } else {
            // Mock OTP Verification
            if (otp.length === 4) {
                navigation.replace('Dashboard');
            }
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                <Text style={styles.title}>Safety First</Text>
                <Text style={styles.subtitle}>
                    {step === 1 ? 'Enter your phone number to get started' : 'Enter the 4-digit OTP sent to your phone'}
                </Text>

                {step === 1 ? (
                    <TextInput
                        style={styles.input}
                        placeholder="Phone Number"
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                        maxLength={10}
                    />
                ) : (
                    <TextInput
                        style={styles.input}
                        placeholder="1 2 3 4"
                        keyboardType="number-pad"
                        value={otp}
                        onChangeText={setOtp}
                        maxLength={4}
                        secureTextEntry
                    />
                )}

                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>{step === 1 ? 'Send OTP' : 'Verify & Login'}</Text>
                </TouchableOpacity>

                {step === 2 && (
                    <TouchableOpacity onPress={() => setStep(1)} style={{ marginTop: 20 }}>
                        <Text style={styles.linkText}>Change Phone Number</Text>
                    </TouchableOpacity>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        color: '#FF2B51',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6c757d',
        marginBottom: 48,
    },
    input: {
        backgroundColor: '#ffffff',
        height: 60,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 18,
        borderWidth: 1,
        borderColor: '#e9ecef',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    button: {
        backgroundColor: '#1D1E2C',
        height: 60,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#1D1E2C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
    linkText: {
        color: '#FF2B51',
        fontWeight: '600',
        textAlign: 'center',
    }
});
