const MessageInputSection = () => {
    const canSend = newMessage.trim().length > 0 && !postingMessage;
    
    return (
      <View style={styles.messageInputContainer}>
        <TextInput
          style={styles.messageInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type your message..."
          placeholderTextColor="#999"
          multiline
          maxLength={500}
          textAlignVertical="top"
          onSubmitEditing={() => {
            if (canSend && !newMessage.includes('\n')) {
              postMessage();
            }
          }}
          blurOnSubmit={false}
        />
        <Pressable 
          onPress={canSend ? postMessage : null}
          style={[
            styles.sendButton,
            !canSend && styles.sendButtonDisabled
          ]}
          disabled={!canSend}
        >
          {postingMessage ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons 
              name="send" 
              size={20} 
              color="white" 
            />
          )}
        </Pressable>
      </View>
    );
  };