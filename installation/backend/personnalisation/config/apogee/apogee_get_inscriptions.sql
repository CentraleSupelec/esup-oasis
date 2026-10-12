-- Inscriptions d'un étudiant, requête propre à l'université Paris-Saclay.
--
-- Le niveau d'études est calculé par famille de diplôme, avec la même règle que
-- apogee_get_formation.sql : la requête intérieure lit Apogée, la requête extérieure applique
-- la règle. OASIS l'enregistre sur la formation à sa création.
select q.*,
       coalesce(
           case
               -- santé (PASS, LAS, études médicales) : pas de niveau L/M/D
               when q.tem_sante = 'O' then null
               -- BUT, DEUST, licence professionnelle (3 ans, 1 an), ingénieur : préfixe et année
               -- dans le diplôme, décalée de 2 pour l'ingénieur (étapes P3 à P5)
               when trim(q.cod_tpd_etb) in ('16', '13', '18', '85', '34') then
                   case when q.annee_diplome >= 1 then
                       decode(trim(q.cod_tpd_etb), '16', 'BUT', '13', 'DEUST', '34', 'ING', 'LP')
                           || to_char(trunc(q.annee_diplome) + decode(trim(q.cod_tpd_etb), '34', 2, 0))
                   end
               -- licence, double licence, master, master MEEF, CPES : entrée du cycle et année dans
               -- le diplôme ; tout autre type de diplôme (DU, échange entrant…) n'a pas de niveau
               when trim(q.cod_tpd_etb) in ('86', '93', '37', '39', '19') and q.annee_diplome >= 1 then
                   decode(decode(trim(q.cycle), '1', 0, '2', 3, '3', 5) + trunc(q.annee_diplome),
                          1, 'L1', 2, 'L2', 3, 'L3', 4, 'M1', 5, 'M2', 6, 'D1', 7, 'D2', 8, 'D3')
               end,
           -- à défaut, le niveau inscrit en tête du code étape (L1INFO, M2ARTS…)
           upper(regexp_substr(q.cod_etp, '^(L[1-3]|M[1-2]|D[1-3])', 1, 1, 'i'))
       ) as niveau
from (select iae.cod_anu,
       vet.cod_etp,
       vet.cod_vrs_vet,
       vet.lib_web_vet,
       cmp.cod_cmp,
       cmp.lib_cmp,
       to_char(i.date_nai_ind, 'YYYY-MM-DD') as date_nai_ind,
       i.cod_sex_etu,
       case
           when annuelle.num_tel_port is not null then trim(annuelle.num_tel_port)
           when fixe.num_tel_port is not null then trim(fixe.num_tel_port)
           when annuelle.num_tel is not null then trim(annuelle.num_tel)
           else trim(fixe.num_tel)
           end                               as num_tel,
       iaa.tem_brs_iaa,
       -- situation sociale : le code NO signifie « non renseigné » dans le paramétrage de
       -- Paris-Saclay, on le neutralise ici plutôt que côté OASIS, qui affiche tout code présent.
       case when iaa.cod_soc = 'NO' then null else iaa.cod_soc end as cod_soc,
       case when iaa.cod_soc = 'NO' then null else soc.lib_soc end as lib_soc,
       rgi.lib_rgi,
       dip.lib_dip,
       dsi.lib_dsi,
       -- adresse : adresse annuelle seule (l'adresse fixe ne sert qu'au téléphone). Ville
       -- via la commune (lib_ade en repli pour l'acheminement à l'étranger), pays en libellé.
       annuelle.lib_ad1 as adr_lib_ad1,
       annuelle.lib_ad2 as adr_lib_ad2,
       annuelle.lib_ad3 as adr_lib_ad3,
       annuelle.cod_bdi as adr_cod_bdi,
       nvl(com.lib_com, annuelle.lib_ade) as adr_lib_vil,
       pay.lib_pay as adr_cod_pay,
       -- redoublement et cursus aménagé : lus pour l'affichage du profil, pas encore par OASIS
       iae.nbr_ins_etp,
       amg.cod_sis_cur_amg,
       amg.lib_cur_amg,
       -- colonnes du calcul du niveau, dans la requête extérieure
       dip.cod_cyc as cycle,       -- cycle du diplôme (1 = Licence, 2 = Master, 3 = Doctorat)
       dip.cod_tpd_etb,            -- type de diplôme (code propre à l'établissement)
       typ.tem_sante,              -- indicateur santé (O/N) porté par le type de diplôme
       (select min(fra.cod_sis_daa_min)
        from vdi_fractionner_vet fra
        where fra.cod_etp = iae.cod_etp
          and fra.cod_vrs_vet = iae.cod_vrs_vet
          and fra.cod_dip = iae.cod_dip) as annee_diplome -- année dans le diplôme (SISE)
from ins_adm_etp iae
         join diplome dip on dip.cod_dip = iae.cod_dip
         left outer join typ_diplome typ on typ.cod_tpd_etb = dip.cod_tpd_etb
         left outer join sec_dis_sis sds on sds.cod_sds = dip.cod_sds
         left outer join discipline_sis dsi on dsi.cod_dsi = sds.cod_dsi
         join individu i on i.cod_ind = iae.cod_ind
         join ins_adm_anu iaa on iaa.cod_ind = i.cod_ind and iaa.cod_anu = iae.cod_anu and iaa.eta_iaa = 'E'
         join regime_ins rgi on rgi.cod_rgi = iaa.cod_rgi
         left outer join sit_sociale soc ON (soc.cod_soc = iaa.cod_soc)
         join composante cmp on cmp.cod_cmp = iae.cod_cmp
         join version_etape vet on vet.cod_etp = iae.cod_etp and vet.cod_vrs_vet = iae.cod_vrs_vet
         left outer join cursus_amg amg on (amg.cod_cur_amg = iae.cod_cur_amg)
         left outer join adresse fixe on fixe.cod_ind = i.cod_ind
         left outer join adresse annuelle on annuelle.cod_ind_ina = i.cod_ind and annuelle.cod_anu_ina = iae.cod_anu
         left outer join commune com on (com.cod_com = annuelle.cod_com)
         left outer join pays pay on (pay.cod_pay = annuelle.cod_pay)
where i.cod_etu = :codEtu
  and iae.cod_anu between :debut and :fin
  and iae.tem_iae_prm = 'O'
  and iae.eta_iae = 'E') q
order by q.cod_anu
