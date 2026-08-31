select iae.cod_anu,
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
       iaa.cod_soc,
       soc.lib_soc,
       rgi.lib_rgi,
       lib_dip,
       ' ' as niveau, -- niveau brut laissé à blanc (table apogee.extern_niveau_etape non disponible ici) ; le niveau LMD est dérivé côté OASIS par NiveauResolver à partir de cycle + annee_diplome (données SISE nationales)
       dsi.lib_dsi,
       -- adresse : schéma UPSaclay = adresse ANNUELLE seule (la fixe ne sert qu'au téléphone).
       -- Ville via jointure commune (lib_ade en repli acheminement étranger), pays via jointure pays (libellé).
       annuelle.lib_ad1 as adr_lib_ad1,
       annuelle.lib_ad2 as adr_lib_ad2,
       annuelle.lib_ad3 as adr_lib_ad3,
       annuelle.cod_bdi as adr_cod_bdi,
       nvl(com.lib_com, annuelle.lib_ade) as adr_lib_vil,
       pay.lib_pay as adr_cod_pay,
       iae.nbr_ins_etp,
       amg.cod_sis_cur_amg,
       amg.lib_cur_amg,
       dip.cod_cyc as cycle, -- cycle du diplôme (1=Licence bac+0, 2=Master bac+3, 3=Doctorat bac+5) : niveau d'entrée
       dip.cod_tpd_etb as cod_tpd_etb, -- type de diplôme (code établissement) : discrimine la famille de diplôme (LMD vs BUT/DUT/ingénieur/DU) ; seuls les types LMD donnent lieu à un niveau L/M/D côté OASIS
       typ.tem_sante, -- indicateur santé (O/N) porté par le type de diplôme : formations PASS/LAS/MED, sans niveau L/M/D affiché
       (select min(fra.cod_sis_daa_min)
        from vdi_fractionner_vet fra
        where fra.cod_etp = iae.cod_etp
          and fra.cod_vrs_vet = iae.cod_vrs_vet
          and fra.cod_dip = iae.cod_dip) as annee_diplome -- année dans le diplôme (cod_sis_daa, SISE national) ; niveau = entrée(cycle) + annee_diplome
from ins_adm_etp iae
         join diplome dip on dip.cod_dip = iae.cod_dip
         left outer join typ_diplome typ on typ.cod_tpd_etb = dip.cod_tpd_etb -- type de diplôme (famille + indicateur santé)
         left outer join sec_dis_sis sds on sds.cod_sds = dip.cod_sds
         left outer join discipline_sis dsi on dsi.cod_dsi = sds.cod_dsi
         -- jointure apogee.extern_niveau_etape retirée : table spécifique Bordeaux, absente à UPSaclay (niveau dérivé côté OASIS)
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
  and iae.eta_iae = 'E'
order by iae.cod_anu
