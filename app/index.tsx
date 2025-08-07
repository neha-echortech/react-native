import { Redirect } from 'expo-router';
import React, { useContext } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function Index() {
  const { isLoggedIn, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return isLoggedIn ? <Redirect href="/home" /> : <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
}); 