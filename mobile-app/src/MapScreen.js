import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

export default function MapScreen() {
    const [journeyStarted, setJourneyStarted] = useState(false);

    // Mock Route Coordinates
    const routeCoords = [
        { latitude: 28.6139, longitude: 77.2090 }, // Start
        { latitude: 28.6150, longitude: 77.2110 },
        { latitude: 28.6170, longitude: 77.2150 }, // End
    ];

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 28.6139,
                    longitude: 77.2090,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                }}
            >
                <Marker coordinate={routeCoords[0]} title="Start Location" pinColor="blue" />
                <Marker coordinate={routeCoords[routeCoords.length - 1]} title="Destination" pinColor="red" />

                {journeyStarted && (
                    <Polyline
                        coordinates={routeCoords}
                        strokeColor="#10b981" // Safe route is green
                        strokeWidth={4}
                    />
                )}
            </MapView>

            <View style={styles.overlayPanel}>
                <View style={styles.routeInfo}>
                    <Text style={styles.infoText}>Safest Route Found</Text>
                    <Text style={styles.infoSubtext}>AI Score: 92/100</Text>
                </View>

                <TouchableOpacity
                    style={[styles.button, journeyStarted ? styles.buttonStop : styles.buttonStart]}
                    onPress={() => setJourneyStarted(!journeyStarted)}
                >
                    <Text style={styles.buttonText}>
                        {journeyStarted ? 'End Journey' : 'Start Journey Monitoring'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    overlayPanel: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    routeInfo: {
        marginBottom: 20,
    },
    infoText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1D1E2C',
    },
    infoSubtext: {
        fontSize: 14,
        color: '#10b981',
        fontWeight: '600',
        marginTop: 4,
    },
    button: {
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonStart: {
        backgroundColor: '#1D1E2C',
    },
    buttonStop: {
        backgroundColor: '#FF2B51',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    }
});
