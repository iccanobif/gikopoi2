<template>
    <div id="login-page">
        <header>
            <div>
                <h1>
                    <a href="/">{{ $t("ui.title") }}</a>
                </h1>
                <h2>{{ $t("ui.subtitle") }}</h2>
            </div>
        </header>
        <form id="login-form">
            <input v-if="passwordInputVisible" type="text" v-model="password" />
            <div id="area-selection">
                <label v-for="(siteArea, index) in props.siteAreas" v-show="!siteArea.unlisted"
                    :for="siteArea.id + '-selection'">
                    <input type="radio" :id="siteArea.id + '-selection'" :value="siteArea.id" v-model="areaId"
                        v-on:click="handleLanguageChange(siteArea)" :disabled="isLoggingIn" />
                    {{ siteArea.name }} [{{
                        $t("ui.login_user_count")! +
                        props.siteAreasInfo[siteArea.id].userCount
                    }}
                    {{
                        $t("ui.login_streamer_count")! +
                        props.siteAreasInfo[siteArea.id].streamCount
                    }}]</label>
            </div>
            <div id="username-selection">
                <label>{{ $t("ui.label_username") }}</label>
                <input id="username-textbox" type="text" v-model="username"
                    v-bind:placeholder="$t('default_user_name')!" :disabled="isLoggingIn" />
                <span v-if="!isValidUsername" class="error">{{ $t("ui.error_invalid_username") }}</span>
            </div>
            <div id="character-selection">
                <label v-for="character in allCharacters" :for="character.characterName + '-selection'"
                    v-show="!character.isHidden" v-bind:class="{
                        'character-selected': character.characterName == characterId,
                    }">
                    <template v-if="character.isHidden">
                        This is a secret, please don't tell anyone.
                        これは秘密です、誰にも言わないでください。
                    </template>
                    <input type="radio" :id="character.characterName + '-selection'" :disabled="isLoggingIn"
                        :value="character.characterName" v-model="characterId" />
                    <img :style="{
                        top: character.portrait.top! * 100 + '%',
                        left: character.portrait.left! * 100 + '%',
                        width: character.portrait.scale! * 100 + '%',
                    }" :src="'characters/' +
                character.characterName +
                '/front-standing.' +
                character.format
                " />
                </label>
            </div>
            <button id="login-button" v-on:click.prevent="handleLoginClick" :disabled="isLoggingIn || !isValidUsername">
                Login
            </button>
        </form>
        <div id="login-footer" translate="no" class="notranslate">
            <Changelog></changelog>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { characters } from "../character";
import { SiteArea, SiteAreasInfo } from "../types";
import Changelog from "../components/change-log.vue";

const emit = defineEmits<{
    login: [
        username: string,
        password: string,
        areaId: string,
        characterId: string
    ];
    setlanguage: [siteArea: SiteArea];
}>();

const props = defineProps({
    areaId: { type: String, required: true },
    passwordInputVisible: { type: Boolean, required: true },
    isLoggingIn: { type: Boolean, required: true },
    siteAreasInfo: { type: Object as () => SiteAreasInfo, required: true },
    siteAreas: { type: Array as () => SiteArea[], required: true },
});

const allCharacters = Object.values(characters);

const username = ref(localStorage.getItem("username") || "");
const password = ref("");
const areaId = ref(props.areaId);
const characterId = ref(localStorage.getItem("characterId") || "giko");

const isValidUsername = computed(() => {
    // Allow usernames up to 20 characters, excluding the tripcode
    return /^.{0,20}(#.*){0,1}$/.test(username.value);
});

const handleLoginClick = () => {
    if (!isValidUsername.value) {
        return;
    }

    emit(
        "login",
        username.value,
        password.value,
        areaId.value,
        characterId.value
    );
};

const handleLanguageChange = (siteArea: SiteArea) => {
    emit("setlanguage", siteArea);
};
</script>

<style scoped>
</style>
