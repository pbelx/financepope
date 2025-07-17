
'''
<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h4">User Management</span>
            <!-- <v-btn
              color="primary"
              @click="navigateTo('/users/members')"
              prepend-icon="mdi-account-group"
            >
              View Members
            </v-btn> -->
          </v-card-title>
          <v-card-text>
            <v-table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id">
                  <td>{{ user.full_name }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <v-btn @click="makeAdmin(user)" size="small" class="mr-2">Make Admin</v-btn>
                    <v-btn @click="makeMember(user)" size="small">Make Member</v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
'''

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAdminApi } from '@/composables/useAdminApi';

const users = ref([]);
const { getAllUsers, makeUserAdmin, makeUserMember } = useAdminApi();
const route = useRoute();

const fetchUsers = async () => {
  try {
    const response = await getAllUsers();
    if (response.success) {
      users.value = response.data.payload;
    }
  } catch (error) {
    console.error('Failed to fetch users:', error);
  }
};

const makeAdmin = async (user) => {
  try {
    await makeUserAdmin(user.id);
    fetchUsers();
  } catch (error) {
    console.error('Failed to make admin:', error);
  }
};

const makeMember = async (user) => {
  try {
    await makeUserMember(user.id);
    fetchUsers();
  } catch (error) {
    console.error('Failed to make member:', error);
  }
};

watch(() => route.path, () => {
  fetchUsers();
});

onMounted(fetchUsers);
</script>
