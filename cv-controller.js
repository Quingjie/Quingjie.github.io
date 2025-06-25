class CVMultilingueJSON {
    constructor() {
        this.languesDisponibles = ['fr-FR', 'en-GB', 'zh-CN'];
        this.langueParDefaut = 'fr-FR';
        this.langueActuelle = this.determinerLangue();
        this.cvData = null;
        this.init();
    }

    /**
     * PRIORITÉS de langue :
     * 1. Paramètre GET (?lang=en)
     * 2. Paramètre POST 
     * 3. Variable de session (localStorage)
     * 4. Accept-Language navigateur
     * 5. Langue par défaut
     */
    determinerLangue() {
        console.log('🔍 Détermination de la langue...');

        // 1. PRIORITÉ 1 : Paramètre GET
        const urlParams = new URLSearchParams(window.location.search);
        const langueGet = urlParams.get('lang');
        if (langueGet && this.languesDisponibles.includes(langueGet)) {
            console.log('✅ Langue trouvée via GET:', langueGet);
            this.sauvegarderLangue(langueGet);
            return langueGet;
        }

        // 2. PRIORITÉ 2 : Paramètre POST
        const languePost = sessionStorage.getItem('cv_langue_post');
        if (languePost && this.languesDisponibles.includes(languePost)) {
            console.log('✅ Langue trouvée via POST:', languePost);
            sessionStorage.removeItem('cv_langue_post');
            this.sauvegarderLangue(languePost);
            return languePost;
        }

        // 3. PRIORITÉ 3 : Variable de session
        const langueSauvegardee = localStorage.getItem('cv_langue');
        if (langueSauvegardee && this.languesDisponibles.includes(langueSauvegardee)) {
            console.log('✅ Langue trouvée via localStorage:', langueSauvegardee);
            return langueSauvegardee;
        }

        // 4. PRIORITÉ 4 : Accept-Language
        const langueNavigateur = this.detecterLangueNavigateur();
        if (langueNavigateur) {
            console.log('✅ Langue trouvée via navigateur:', langueNavigateur);
            this.sauvegarderLangue(langueNavigateur);
            return langueNavigateur;
        }

        // 5. PRIORITÉ 5 : Langue par défaut
        console.log('✅ Langue par défaut utilisée:', this.langueParDefaut);
        this.sauvegarderLangue(this.langueParDefaut);
        return this.langueParDefaut;
    }

    detecterLangueNavigateur() {
        const langues = navigator.languages || [navigator.language || navigator.userLanguage];
        
        for (const langue of langues) {
            if (this.languesDisponibles.includes(langue)) {
                return langue;
            }
            
            const langueBase = langue.split('-')[0];
            for (const langueDisp of this.languesDisponibles) {
                if (langueDisp.startsWith(langueBase + '-')) {
                    return langueDisp;
                }
            }
        }
        
        return null;
    }

    sauvegarderLangue(langue) {
        localStorage.setItem('cv_langue', langue);
        console.log('💾 Langue sauvegardée:', langue);
    }

    /**
     * Charge les données depuis cv-data.json au lieu de XML/XSLT
     */
    async chargerDonnees() {
        try {
            console.log('📄 Chargement cv-data.json...');
            
            const response = await fetch('cv-data.json');
            if (!response.ok) {
                throw new Error('Fichier cv-data.json non trouvé');
            }
            
            this.cvData = await response.json();
            console.log('✅ Données JSON chargées avec succès');
            return this.cvData;
            
        } catch (error) {
            console.error('❌ Erreur chargement JSON:', error);
            
            // Fallback vers fichiers HTML statiques
            return this.chargerDepuisHTML();
        }
    }

    /**
     * Fallback vers les fichiers HTML statiques
     */
    async chargerDepuisHTML() {
        const fichiers = {
            'fr-FR': 'cv_fr.html',
            'en-GB': 'cv_en.html',
            'zh-CN': 'cv_zh.html'
        };
        
        const fichier = fichiers[this.langueActuelle];
        
        try {
            console.log('🔄 Fallback vers:', fichier);
            
            const response = await fetch(fichier);
            if (!response.ok) {
                throw new Error('Fichier HTML statique non trouvé');
            }
            
            const htmlContent = await response.text();
            
            // Extraire le contenu du body
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            const bodyContent = doc.body.innerHTML;
            
            // Remplacer le contenu
            document.body.innerHTML = bodyContent;
            
            console.log('✅ CV chargé depuis HTML statique:', fichier);
            return true;
            
        } catch (error) {
            console.error('❌ Erreur fallback HTML:', error);
            this.afficherErreur();
            return false;
        }
    }

    /**
     * Génère le CV depuis les données JSON
     */
    genererCVDepuisJSON(langue) {
        if (!this.cvData) return false;
        
        try {
            // Fonction utilitaire pour récupérer le texte
            const getText = (obj) => {
                if (!obj) return '';
                if (typeof obj === 'string') return obj;
                return obj[langue] || obj['fr-FR'] || Object.values(obj)[0] || '';
            };
            
            // Générer le HTML (version simplifiée)
            const html = this.construireHTML(this.cvData, langue, getText);
            
            // Remplacer le contenu
            document.body.innerHTML = html;
            
            // Réattacher les événements
            this.attacherEvenements();
            
            console.log('✅ CV généré depuis JSON en', langue);
            return true;
            
        } catch (error) {
            console.error('❌ Erreur génération JSON:', error);
            return false;
        }
    }

    /**
     * Construit le HTML du CV (version basique)
     */
    construireHTML(data, langue, getText) {
        return '<div class="lang-selector">' +
            '<a class="lang-button ' + (langue === 'fr-FR' ? 'active' : '') + '" href="?lang=fr-FR">🇫🇷 FR</a>' +
            '<a class="lang-button ' + (langue === 'en-GB' ? 'active' : '') + '" href="?lang=en-GB">🇬🇧 EN</a>' +
            '<a class="lang-button ' + (langue === 'zh-CN' ? 'active' : '') + '" href="?lang=zh-CN">🇨🇳 中文</a>' +
        '</div>' +
        '<div class="main-content">' +
            '<div class="header">' +
                '<h1>' + data.identity.firstName + ' ' + data.identity.lastName + '</h1>' +
                '<h2>' + getText(data.identity.title) + '</h2>' +
                '<div>' + getText(data.identity.presentation) + '</div>' +
            '</div>' +
            '<p style="text-align: center; color: #666; margin: 40px 0;">' +
                'CV généré automatiquement depuis cv-data.json<br>' +
                'Langue: ' + langue +
            '</p>' +
        '</div>';
    }

    /**
     * Change la langue
     */
    changerLangue(nouvelleLangue) {
        if (!this.languesDisponibles.includes(nouvelleLangue)) return;
        
        console.log('🔄 Changement de langue vers:', nouvelleLangue);
        
        this.langueActuelle = nouvelleLangue;
        this.sauvegarderLangue(nouvelleLangue);
        
        // Mettre à jour l'URL
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('lang', nouvelleLangue);
        window.history.pushState({}, '', newUrl);
        
        // Recharger le CV
        this.chargerCV();
    }

    /**
     * Charge et affiche le CV
     */
    async chargerCV() {
        console.log('📄 Chargement du CV en langue:', this.langueActuelle);
        
        // Masquer le chargement
        const loading = document.querySelector('.loading');
        if (loading) {
            loading.style.display = 'none';
        }
        
        // Essayer JSON d'abord
        if (!this.cvData) {
            await this.chargerDonnees();
        }
        
        if (this.cvData) {
            const success = this.genererCVDepuisJSON(this.langueActuelle);
            if (!success) {
                await this.chargerDepuisHTML();
            }
        } else {
            await this.chargerDepuisHTML();
        }
    }

    /**
     * Attache les événements
     */
    attacherEvenements() {
        setTimeout(() => {
            const boutons = document.querySelectorAll('.lang-button');
            boutons.forEach(bouton => {
                bouton.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    const href = bouton.getAttribute('href');
                    const urlParams = new URLSearchParams(href.split('?')[1]);
                    const nouvelleLangue = urlParams.get('lang');
                    
                    if (nouvelleLangue) {
                        this.changerLangue(nouvelleLangue);
                    }
                });
            });
        }, 100);
    }

    afficherErreur() {
        document.body.innerHTML = 
            '<div style="padding: 40px; text-align: center; font-family: Arial, sans-serif;">' +
                '<h1 style="color: #e74c3c;">❌ Erreur de chargement</h1>' +
                '<p>Impossible de charger le CV.</p>' +
                '<p><strong>Fichiers requis:</strong> cv-data.json OU cv_fr.html, cv_en.html, cv_zh.html</p>' +
                '<button onclick="location.reload()" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">🔄 Recharger</button>' +
            '</div>';
    }

    async init() {
        console.log('🚀 Initialisation CV Multilingue JSON');
        await this.chargerCV();
    }
}

// Démarrage
let cvController;
document.addEventListener('DOMContentLoaded', () => {
    cvController = new CVMultilingueJSON();
});

// Fonctions globales
window.cvController = cvController;