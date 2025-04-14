import { api } from '@/lib/api'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { PUSHER_API_KEY, PUSHER_CLUSTER } from '@/utils/config'

export const laravelEcho = (namespace: string = 'App.Events') =>
    new Echo({
        broadcaster: 'pusher',
        key: PUSHER_API_KEY,
        namespace: namespace,
        client: new Pusher(PUSHER_API_KEY, {
            cluster: PUSHER_CLUSTER,
            forceTLS: true,
            authorizer: channel => {
                return {
                    authorize: (socketId, callback) => {
                        api.post('/api/broadcasting/auth', {
                            socket_id: socketId,
                            channel_name: channel.name
                        })
                            .then(response => {
                                callback(null, response.data)
                            })
                            .catch(error => {
                                callback(error, null)
                            })
                    }
                }
            }
        })
    })
