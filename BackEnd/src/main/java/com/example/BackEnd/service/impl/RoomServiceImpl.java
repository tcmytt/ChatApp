package com.example.BackEnd.service.impl;

import com.example.BackEnd.dto.*;
import com.example.BackEnd.entity.RoomMembers;
import com.example.BackEnd.entity.RoomMembers.MemberRole;
import com.example.BackEnd.entity.Rooms;
import com.example.BackEnd.entity.Users;
import com.example.BackEnd.repository.RoomMembersRepository;
import com.example.BackEnd.repository.RoomsRepository;
import com.example.BackEnd.repository.UsersRepository;
import com.example.BackEnd.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class RoomServiceImpl implements RoomService {

    @Autowired
    private RoomsRepository roomsRepository;
    @Autowired
    private UsersRepository usersRepository;
    @Autowired
    private RoomMembersRepository roomMembersRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final String CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int CODE_LENGTH = 6;
    private static final Random RANDOM = new SecureRandom();

    private String generateUniqueRoomCode() {
        String code;
        do {
            code = RANDOM.ints(CODE_LENGTH, 0, CODE_CHARS.length())
                    .mapToObj(i -> String.valueOf(CODE_CHARS.charAt(i)))
                    .collect(Collectors.joining());
        } while (roomsRepository.existsByCode(code));
        return code;
    }

    @Override
    @Transactional
    public RoomResponse createRoom(String creatorEmail, RoomCreateRequest request) {
        Users creator = usersRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new IllegalArgumentException("Creator not found"));

        String code = generateUniqueRoomCode();
        Rooms room = new Rooms();
        room.setName(request.name());
        room.setCreator(creator);
        room.setCode(code);
        room.setMaxMembers(request.maxMembers());
        if (request.password() != null && !request.password().isBlank()) {
            room.setPasswordHash(passwordEncoder.encode(request.password()));
        }
        Rooms savedRoom = roomsRepository.save(room);

        // Add creator as room member (role: CREATOR)
        RoomMembers member = new RoomMembers();
        member.setRoom(savedRoom);
        member.setUser(creator);
        member.setRole(MemberRole.CREATOR);
        roomMembersRepository.save(member);

        return new RoomResponse(
                savedRoom.getId(),
                savedRoom.getName(),
                savedRoom.getCode(),
                savedRoom.getMaxMembers(),
                creator.getUsername(),
                1);
    }

    @Override
    @Transactional
    public RoomResponse joinRoom(String userEmail, RoomJoinRequest request) {
        Users user = usersRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Rooms room = roomsRepository.findByCode(request.code())
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

        // Check password if room has password
        if (room.getPasswordHash() != null && !room.getPasswordHash().isBlank()) {
            if (request.password() == null || !passwordEncoder.matches(request.password(), room.getPasswordHash())) {
                throw new IllegalArgumentException("Incorrect password");
            }
        }

        // Check max members
        Long memberCount = roomsRepository.countMembersByRoomId(room.getId());
        if (memberCount >= room.getMaxMembers()) {
            throw new IllegalArgumentException("Room is full");
        }

        // Check if user already in room
        if (roomMembersRepository.existsByRoomIdAndUserId(room.getId(), user.getId())) {
            throw new IllegalArgumentException("User already in room");
        }

        // Add user as member
        RoomMembers member = new RoomMembers();
        member.setRoom(room);
        member.setUser(user);
        member.setRole(MemberRole.MEMBER);
        roomMembersRepository.save(member);

        return new RoomResponse(
                room.getId(),
                room.getName(),
                room.getCode(),
                room.getMaxMembers(),
                room.getCreator().getUsername(),
                memberCount.intValue() + 1);
    }

    @Override
    @Transactional
    public void deleteRoom(String userEmail, Long roomId) {
        Users user = usersRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Rooms room = roomsRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));
        if (!room.getCreator().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Only the room creator can delete the room");
        }
        // Xóa room, cascade sẽ xóa RoomMembers và Messages
        roomsRepository.delete(room);
    }

    @Override
    @Transactional(readOnly = true)
    public RoomSearchResponse searchRooms(String query, int page, int size) {
        Page<Rooms> roomsPage = roomsRepository.searchRooms(query, PageRequest.of(page, size));
        List<RoomResponse> rooms = roomsPage.getContent().stream().map(room -> new RoomResponse(
                room.getId(),
                room.getName(),
                room.getCode(),
                room.getMaxMembers(),
                room.getCreator().getUsername(),
                room.getRoomMembers() != null ? room.getRoomMembers().size() : 0)).collect(Collectors.toList());
        return new RoomSearchResponse(rooms, page, size, roomsPage.getTotalElements());
    }

    @Override
    @Transactional
    public void kickMember(String userEmail, Long roomId, Long userIdToKick) {
        Users user = usersRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Rooms room = roomsRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));
        if (!room.getCreator().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Only the room creator can kick members");
        }
        if (user.getId().equals(userIdToKick)) {
            throw new IllegalArgumentException("Creator cannot kick themselves");
        }
        RoomMembers member = roomMembersRepository.findByRoomIdAndUserId(roomId, userIdToKick)
                .orElseThrow(() -> new IllegalArgumentException("User is not a member of the room"));
        roomMembersRepository.delete(member);
    }
}