import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Alert } from 'react-native';

export default function DashboardScreen({ navigation }) {
    const [riskScore, setRiskScore] = useState(12);

    const handleSOS = async () => {
        try {
            // Mock SOS trigger delay
            await new Promise(resolve => setTimeout(resolve, 800));
            Alert.alert(
                "SOS Triggered!",
                "Emergency contacts and nearby police have been notified with your live location. Help is on the way.",
                [{ text: "OK", style: "cancel" }]
            );
        } catch (error) {
            Alert.alert("Network Error", "Could not reach the emergency servers.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>Hey Priya,</Text>
                <Text style={styles.status}>You are currently in a Safe Zone</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.dashboardCard}>
                    <Text style={styles.scoreTitle}>Live Safety Score</Text>
                    <Text style={[styles.scoreValue, { color: riskScore < 40 ? '#10b981' : '#f59e0b' }]}>
                        {100 - riskScore} / 100
                    </Text>
                    <Text style={[styles.scoreStatus, { color: riskScore < 40 ? '#10b981' : '#f59e0b' }]}>
                        {riskScore < 40 ? 'Safe Area' : 'Moderate Risk'}
                    </Text>
                </View>

                <TouchableOpacity style={styles.sosButton} activeOpacity={0.8} onPress={handleSOS}>
                    <Text style={styles.sosText}>SOS</Text>
                    <Text style={styles.sosSubtext}>Tap in emergency</Text>
                </TouchableOpacity>

                <View style={styles.actionGrid}>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('Map')}
                    >
                        <Text style={styles.actionEmoji}>🗺️</Text>
                        <Text style={styles.actionText}>Safe Route</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard}>
                        <Text style={styles.actionEmoji}>👥</Text>
                        <Text style={styles.actionText}>Contacts</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard}>
                        <Text style={styles.actionEmoji}>🛡️</Text>
                        <Text style={styles.actionText}>Fake Call</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard}>
                        <Text style={styles.actionEmoji}>👮</Text>
                        <Text style={styles.actionText}>Nearby Station</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { padding: 24, paddingTop: 40, paddingBottom: 10 },
    greeting: { fontSize: 28, fontWeight: '800', color: '#1D1E2C' },
    status: { fontSize: 16, color: '#6c757d', marginTop: 4 },
    content: { flex: 1, padding: 24, alignItems: 'center' },
    dashboardCard: {
        width: '100%', backgroundColor: '#ffffff', padding: 24,
        borderRadius: 24, alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05, shadowRadius: 15, elevation: 4, marginBottom: 30,
    },
    scoreTitle: { fontSize: 14, color: '#6c757d', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
    scoreValue: { fontSize: 64, fontWeight: '900', marginBottom: 4 },
    scoreStatus: { fontSize: 18, fontWeight: '700' },
    sosButton: {
        width: 180, height: 180, borderRadius: 90, backgroundColor: '#FF2B51',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#FF2B51', shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4, shadowRadius: 20, elevation: 10, marginBottom: 40,
        borderWidth: 6, borderColor: '#fff'
    },
    sosText: { color: 'white', fontSize: 42, fontWeight: '900', letterSpacing: 2 },
    sosSubtext: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4, fontWeight: '600' },
    actionGrid: {
        flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%'
    },
    actionCard: {
        width: '48%', backgroundColor: '#fff', padding: 16, borderRadius: 16,
        alignItems: 'center', justifyContent: 'center', marginBottom: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
    },
    actionEmoji: { fontSize: 32, marginBottom: 8 },
    actionText: { fontSize: 14, fontWeight: '600', color: '#1D1E2C' }
});
