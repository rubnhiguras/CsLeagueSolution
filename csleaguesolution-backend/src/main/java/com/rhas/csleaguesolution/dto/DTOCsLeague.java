package com.rhas.csleaguesolution.dto;

import java.sql.Timestamp;
import java.util.Collection;
import java.util.Set;

public class DTOCsLeague {

    // Response DTOs
    public record CompetitionsResponse(Long id, String name, String largename, String avatarUrl, boolean disabled, Timestamp iniDateTime, Timestamp endDateTime) {}

    public static final String CONTEXT_SYSTEM = "CSLEAGUE";
    public static final String PERMISSION_CREATE_COMPETITION = "PERMISSION_CREATE_COMPETITION";
    public static final String PERMISSION_EDIT_COMPETITION = "PERMISSION_EDIT_COMPETITION";
    public static final String PERMISSION_CREATE_MATCH = "PERMISSION_CREATE_MATCH";
    public static final String PERMISSION_EDIT_MATCH = "PERMISSION_EDIT_MATCH";
    public static final String PERMISSION_EDIT_MATCH_STATS = "PERMISSION_EDIT_MATCH_STATS";
    public static final String PERMISSION_CREATE_NEWS = "PERMISSION_CREATE_NEWS";
    public static final String PERMISSION_EDIT_NEWS = "PERMISSION_EDIT_NEWS";


}