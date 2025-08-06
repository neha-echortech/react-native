import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';

const HomeScreen: React.FC = () => {
  const { username, logout } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout();
    // navigation switches automatically due to context change
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome, {username ?? 'Guest'}!</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  welcome: { fontSize: 24, marginBottom: 20 },
});

export default HomeScreen;
