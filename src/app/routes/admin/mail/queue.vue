<script setup lang="ts">
import { mailAdditionalSettingsPath } from '@lib/mail/mail-additional-settings'

await navigateTo(mailAdditionalSettingsPath('queue'), { replace: true })
</script>
